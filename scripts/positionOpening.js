//position opening
function OpeningPosition(){

}

OpeningPosition.prototype.draw = function(play){
    //ufo hunter
    //clear canvas
    ctx.clearRect(0,0, play.width, play.height);
    ctx.font="80px Comic Sans MS";
    ctx.textAlign="center";
    const gradient = ctx.createLinearGradient((play.width/2-180), (play.height/2), (play.width/2+180), (play.height/2));
    gradient.addColorStop("0","yellow");
    gradient.addColorStop("0.5","red");
    gradient.addColorStop("1.0","yellow");
    ctx.fillStyle= gradient;
    ctx.fillText("UFO HUNTER", play.width/2, play.height/2-70);

    //press 'space' to start
    ctx.font="40px Comic Sans MS";
    ctx.fillStyle='#D7DF01';
    ctx.fillText("Press 'Space' to start.", play.width/2, play.height/2);

    //gamecontrols
    ctx.fillStyle='#2e2f00';
    ctx.fillText("Game Controls", play.width/2, play.height/2 +210);
    ctx.fillText("Left Arrow", play.width/2, play.height/2 +260);
    ctx.fillText("Right Arrow", play.width/2, play.height/2 +300);
    ctx.fillText("Space: Fire", play.width/2, play.height/2 +340);

};

OpeningPosition.prototype.keyDown = function(play, keyboardCode) {
    //when we start game with Spacebar
    if (keyboardCode == 32) {
        play.level = 1;
        play.score = 0;
        play.shields = 2;
        play.goToPosition(new TransferPosition(play.level));
    }
};