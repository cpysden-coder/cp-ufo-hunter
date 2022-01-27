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
    presentLevel = this.level;
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
    //temp for demo purposes only to show how the above frontLineUFOs array gets updated
    // if (this.temp < 1) {
    //     console.log(frontLineUFOs);
    //     this.temp++;
    // }
}

InGamePosition.prototype.shoot = function (){
    if(this.lastBulletTime === null || ((new Date()).getTime() - this.lastBulletTime) > (this.setting.bulletMaxFrequency)) {
        // console.log("We are shooting!");
        this.object = new Objects();
        this.bullets.push(this.object.bullet(this.spaceship.x, this.spaceship.y - this.spaceship.height/2, this.setting.bulletSpeed));
        this.lastBulletTime = (new Date()).getTime();
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
}

InGamePosition.prototype.keyDown = function (play, keyboardCode) {
        // if(keyboardCode == 37) {
        //     this.spaceship.x -= this.spaceshipSpeed * this.upSec;
        // }
        // if(keyboardCode == 39) {
        //     this.spaceship.x += this.spaceshipSpeed * this.upSec;
        // }
}