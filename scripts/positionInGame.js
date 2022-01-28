// --- positionInGame --- //

function InGamePosition(setting, level) {
    this.setting = setting;
    this.level = level;
    this.object = null;
    this.spaceship = null;
    this.bullets = [];
    this.lastBulletTime = null;
    this.ufos = [];
    this.bombs = [];

}

InGamePosition.prototype.entry = function (play) {
    this.spaceship_image = new Image(); 
    this.upSec = this.setting.updateSeconds;
    this.spaceshipSpeed = this.setting.spaceshipSpeed;
    this.ufo_image = new Image();
    this.turnAround = 1; //for controlling left to right movement of ufos. 1 = they are moving to right, -1 = they are moving to left
    this.horizontalMoving = 1; //1 means true basically
    this.verticalMoving = 0; // 0 means false basically
    this.ufosAreSinking = false;
    this.ufoPresentSinkingValue = 0;

    this.object = new Objects();
    this.spaceship = this.object.spaceship((play.width / 2), play.playBoundaries.bottom, this.spaceship_image);
    //values that change with levels(1. UFO speed, 2. Bomb falling speed, 3. Bomb dropping frequency)
    let presentLevel = this.level < 11 ? this.level : 10;
    //1. UFO Speed
    this.ufoSpeed = this.setting.ufoSpeed + (presentLevel * 7); //level1: 35 + (1 * 7), level2: 35 + (2 * 7)
    //2. Bomb falling speed
    this.bombSpeed = this.setting.bombSpeed + (presentLevel * 10); //similar logic to ufoSpeed
    this.bombFrequency = this.setting.bombFrequency + (presentLevel * 0.05); //0.05 represent probabilities that a ufo will drop a bomb

    //creating UFOS positions
    const lines = this.setting.ufoLines;
    const columns = this.setting.ufoColumns;
    const ufosInitial = [];

    let line, column;
    //iterate thru lines and columns of UFO
    for (line = 0; line < lines; line++){
        for (column = 0; column < columns; column++){
            this.object = new Objects();
            let x, y;
            x = (play.width/2) + (column * 50) - ((columns-1) * 25);
            y = (play.playBoundaries.top + 30) + (line * 30);
            ufosInitial.push(this.object.ufo(
                x,
                y,
                line,
                column,
                this.ufo_image
            ))
        }
    }
    this.ufos = ufosInitial;

    this.temp = 0; //used in function to determine if UFO is in firing line

}

InGamePosition.prototype.update = function (play) {
    
    const spaceship = this.spaceship;
    const spaceshipSpeed = this.spaceshipSpeed;
    const upSec = this.setting.updateSeconds;
    const bullets = this.bullets;
    
    if (play.pressedKeys[37]) {
        spaceship.x -= spaceshipSpeed * upSec;
    }
    if (play.pressedKeys[39]) {
        spaceship.x += spaceshipSpeed * upSec;
    }
    // if user fires: hits spacebar
    if (play.pressedKeys[32]){
        this.shoot();
    }
    if (spaceship.x < play.playBoundaries.left){
        spaceship.x = play.playBoundaries.left;
    }    
    if (spaceship.x > play.playBoundaries.right){
        spaceship.x = play.playBoundaries.right;
    }
    //moving bullets
    for (let i = 0; i < bullets.length; i++){
        let bullet = bullets[i];
        bullet.y -= upSec * this.setting.bulletSpeed;
        //if our bullet leaves the canvas area, clear
        if (bullet.y < 0){
            bullets.splice(i--, 1);
        }
    }
    //moving UFOs
    let reachedSide = false;

    for (let i = 0; i < this.ufos.length; i++){
        let ufo = this.ufos[i];
        let fresh_x = ufo.x + this.ufoSpeed * upSec * this.turnAround * this.horizontalMoving;
        let fresh_y = ufo.y + this.ufoSpeed * upSec * this.verticalMoving;
        //if x coordinate hits right or left edge then change direction and move ufos down
        if (fresh_x > play.playBoundaries.right || fresh_x < play.playBoundaries.left){
            this.turnAround *= -1;
            reachedSide = true;
            this.horizontalMoving = 0;
            this.verticalMoving = 1;
            this.ufosAreSinking = true;

        }
        if (reachedSide !== true){   
            ufo.x = fresh_x;
            ufo.y = fresh_y;
        }
    }
    //conditional statement to move ufos down 30px sinking value
    if (this.ufosAreSinking == true){
        this.ufoPresentSinkingValue += this.ufoSpeed * upSec;
        if (this.ufoPresentSinkingValue >= this.setting.ufoSinkingValue){
            this.ufosAreSinking = false;
            this.verticalMoving = 0;
            this.horizontalMoving = 1;
            this.ufoPresentSinkingValue = 0;
        }
    }
    //UFOs Bombing
    //build an array with just the bottom ufo for each column - the only ufo that can fire
    const frontLineUFOs = [];
    for (let i = 0; i < this.ufos.length; i++){
        let ufo = this.ufos[i];
        //compare ufo line in column with previous
        if (!frontLineUFOs[ufo.column] || frontLineUFOs[ufo.column].line < ufo.line){
            frontLineUFOs[ufo.column] = ufo;
        }
    }

    //chance of UFO bombing
    for (let i = 0; i < this.setting.ufoColumns; i++){
        let ufo = frontLineUFOs[i];
        if (!ufo) continue;
        let chance = this.bombFrequency * upSec;
        this.object = new Objects();
        if (chance > Math.random()){
            //make a bomb object and put it into a bombs array
            this.bombs.push(this.object.bomb(ufo.x, ufo.y + ufo.height/2))
        }
    }
    // moving bombs
    for (let i = 0; i < this.bombs.length; i++){
        let bomb = this.bombs[i];
        bomb.y += this.bombSpeed * upSec;
        //if a bomb falls off canvas delete it
        if (bomb.y > this.height) {
            this.bombs.splice(i--, 1);
        }
    }
    //UFO - bullet collision
    for (let i = 0; i < this.ufos.length; i++){
        let ufo = this.ufos[i];
        let collision = false;
        for (let j = 0; j < bullets.length; j++){
            let bullet = this.bullets[j];
            //collision check
            if (bullet.x >= (ufo.x - ufo.width/2) && bullet.x <= (ufo.x + ufo.width/2) && bullet.y >= (ufo.y - ufo.height/2) && bullet.y <= (ufo.y + ufo.height/2)) {
                bullets.splice(j--, 1);
                collision = true;
                play.score += this.setting.pointsPerUFO; //increments score when UFO hit by bullet
            }
        }
        //if there's a collision delete UFO
        if (collision == true){
            this.ufos.splice(i--, 1);
            play.sounds.playSound('ufoDeath')
        }
    }
    //consider spaceship collision with a bomb
    for (let i = 0; i < this.bombs.length; i++){
        let bomb = this.bombs[i];
        if (bomb.x + 2 >= (spaceship.x - spaceship.width/2) && bomb.x - 2 <= (spaceship.x + spaceship.width/2) && bomb.y + 6 >= (spaceship.y - spaceship.height/2) && bomb.y <= (spaceship.y + spaceship.height/2)) {
            this.bombs.splice(i--, 1);
            play.sounds.playSound('explosion') // play explosion sound
            //effect on spaceship - go to game over or start position
            play.shields--;
            
        }
    }
    //consider UFO and spaceship collision
    for (let i = 0; i < this.ufos.length; i++){
        let ufo = this.ufos[i];
        if((ufo.x + ufo.width/2) > (spaceship.x - spaceship.width/2) && (ufo.x - ufo.width/2) < (spaceship.x + spaceship.width/2) && (ufo.y + ufo.height/2) > (spaceship.y - spaceship.height/2) && (ufo.y - ufo.height/2) < (spaceship.y + spaceship.height/2)) {
            play.sounds.playSound('explosion')
            // if there's a collision go to game over or start position
            play.shields = -1; //instant death
            
        }
    }
    // handle shields and game updates
    if(play.shields < 0){
        play.goToPosition(new GameOverPosition());
    }
    // update level during play - base on ufos array being empty
    if(this.ufos.length == 0){
        play.level += 1;
        play.goToPosition(new TransferPosition(play.level));
    }
}

InGamePosition.prototype.shoot = function (){
    if(this.lastBulletTime === null || ((new Date()).getTime() - this.lastBulletTime) > (this.setting.bulletMaxFrequency)) {
        // console.log("We are shooting!");
        this.object = new Objects();
        this.bullets.push(this.object.bullet(this.spaceship.x, this.spaceship.y - this.spaceship.height/2, this.setting.bulletSpeed));
        this.lastBulletTime = (new Date()).getTime();
        play.sounds.playSound('shot'); //whenever we hit a space there is a shot and this will now be associated with the shoot function
    }
} 



InGamePosition.prototype.draw = function (play) {
    ctx.clearRect(0, 0, play.width, play.height);
    ctx.drawImage(this.spaceship_image, this.spaceship.x - (this.spaceship.width / 2), this.spaceship.y - (this.spaceship.height / 2));
    //draw bullets
    ctx.fillStyle = '#ff0000';
    for (let i = 0; i < this.bullets.length; i++) {
        let bullet = this.bullets[i];
        ctx.fillRect(bullet.x-1, bullet.y-6, 2, 6) //2, 6 is size of rectangle for bullet
        //TODO this is not painting bullet on screen. Check the code in resources!!!!!!!!!!!!!!!!!!
    }
    //draw UFO
    for (let i = 0; i < this.ufos.length; i++){
        let ufo = this.ufos[i];
        ctx.drawImage(this.ufo_image, ufo.x - (ufo.width/2), ufo.y - (ufo.height/2));
    }
    //draw bombs
    ctx.fillStyle = '#FE2EF7';
    for (let i = 0; i < this.bombs.length; i++){
        let bomb = this.bombs[i];
        ctx.fillRect(bomb.x -2, bomb.y, 4, 6)
    }
    //draw Sound & Mute info
    ctx.font = "16px Comic Sans MS";
    ctx.fillStyle = "#424242";
    ctx.textAlign = "left";
    ctx.fillText("Press s to switch sound effects on/off. Sound:", play.playBoundaries.left, play.playBoundaries.bottom + 70);
    //post to screen if sound is on or off
    let soundStatus = (play.sounds.muted === true) ? "OFF" : "ON";
    ctx.fillStyle = (play.sounds.muted === true) ? "#FF0000" : "#0B6121";
    ctx.fillText(soundStatus, play.playBoundaries.left + 375, play.playBoundaries.bottom + 70);

    ctx.fillStyle = "#424242";
    ctx.textAlign = "right";
    ctx.fillText("Press p to pause.", play.playBoundaries.right, play.playBoundaries.bottom + 70);

    //show user score and level in game canvas
    ctx.fillStyle = "#BDBDBD";
    ctx.textAlign = "center";
    //score
    ctx.font = "24px Comic Sans MS";
    ctx.fillText("Score", play.playBoundaries.right, play.playBoundaries.top - 75);
    ctx.font = "30px Comic Sans MS";
    ctx.fillText(play.score, play.playBoundaries.right, play.playBoundaries.top - 25);
    //level
    ctx.font = "24px Comic Sans MS";
    ctx.fillText("Level", play.playBoundaries.left, play.playBoundaries.top - 75);
    ctx.font = "30px Comic Sans MS";
    ctx.fillText(play.level, play.playBoundaries.left, play.playBoundaries.top - 25);
    //shields status
    ctx.textAlign = "center";
    if(play.shields > 0){
        ctx.fillStyle = "#BDBDBD";
        ctx.font = "bold 24px Comic Sans MS";
        ctx.fillText("Shields", play.width/2, play.playBoundaries.top -75);
        ctx.font = "bold 30px Comic Sans MS";
        ctx.fillText(play.shields, play.width/2, play.playBoundaries.top -25);
    } else {
        ctx.fillStyle = "#ff4d4d";
        ctx.font = "bold 24px Comic Sans MS";
        ctx.fillText("WARNING", play.width/2, play.playBoundaries.top -75);
        ctx.fillStyle = "#BDBDBD";
        ctx.fillText("No shields left", play.width/2, play.playBoundaries.top -25);
    }
}

InGamePosition.prototype.keyDown = function (play, keyboardCode) {
    // lowercase s to mute
    if(keyboardCode == 83){
        play.sounds.muteSwitch();
    }
    // lowercase p to pause
    if(keyboardCode == 80){
        play.pushPosition(new PausePosition())

    }
}
