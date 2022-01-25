// --- positionInGame --- //

function InGamePosition(setting, level) {
    this.setting = setting;
    this.level = level;
    this.object = null;
    this.spaceship = null;
    this.bullets = [];
}

InGamePosition.prototype.entry = function (play) {
    this.spaceship_image = new Image(); 
    this.upSec = this.setting.updateSeconds;
    this.spaceshipSpeed = this.setting.spaceshipSpeed;

    this.object = new Objects();
    this.spaceship = this.object.spaceship((play.width / 2), play.playBoundaries.bottom, this.spaceship_image);
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
}

InGamePosition.prototype.shoot = function (){
    this.object = new Objects();
    this.bullets.push(this.object.bullet(this.spaceship.x, this.spaceship.y - this.spaceship.height/2, this.setting.bulletSpeed))
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
}

InGamePosition.prototype.keyDown = function (play, keyboardCode) {
        // if(keyboardCode == 37) {
        //     this.spaceship.x -= this.spaceshipSpeed * this.upSec;
        // }
        // if(keyboardCode == 39) {
        //     this.spaceship.x += this.spaceshipSpeed * this.upSec;
        // }
}