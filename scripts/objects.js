// objects

function Objects(){

};

Objects.prototype.spaceship = function(x,y,spaceship_image){
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 28;
    this.spaceship_image = spaceship_image;
    this.spaceship_image.src = "images/ship.png"
    return this;
};

Objects.prototype.bullet = function(x,y){
    this.x = x;
    this.y = y;
    return this;
};