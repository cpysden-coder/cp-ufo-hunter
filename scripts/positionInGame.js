// --- positionInGame --- //

function InGamePosition(setting, level) {
    this.setting = setting;
    this.level = level;
    this.object = null;
    this.spaceship = null;
    this.bullets = [];
    this.lastBulletTime = null;
    this.ufos = [];
}

InGamePosition.prototype.entry = function (play) {
    this.spaceship_image = new Image(); 
    this.upSec = this.setting.updateSeconds;
    this.spaceshipSpeed = this.setting.spaceshipSpeed;
    this.ufo_image = new Image();
    this.turnAround = 1; //for controlling left to right movement of ufos. 1 = they are moving to right, -1 = they are moving to left

    this.object = new Objects();
    this.spaceship = this.object.spaceship((play.width / 2), play.playBoundaries.bottom, this.spaceship_image);
    //values that change with levels(1. UFO speed, 2. Bomb falling speed, 3. Bomb dropping frequency)
    presentLevel = this.level;
    //1. UFO Speed
    this.ufoSpeed = this.setting.ufoSpeed + (presentLevel * 7); //level1: 35 + (1 * 7), level2: 42 + (2 * 7)
    //2. Bomb falling speed

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
        let fresh_x = ufo.x + this.ufoSpeed * upSec * this.turnAround;
        
        if (fresh_x > play.playBoundaries.right || fresh_x < play.playBoundaries.left){
            this.turnAround *= -1;
            reachedSide = true;
        }
        if (reachedSide !== true){   
            ufo.x = fresh_x;
        }
    }
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
}

InGamePosition.prototype.keyDown = function (play, keyboardCode) {
        // if(keyboardCode == 37) {
        //     this.spaceship.x -= this.spaceshipSpeed * this.upSec;
        // }
        // if(keyboardCode == 39) {
        //     this.spaceship.x += this.spaceshipSpeed * this.upSec;
        // }
}