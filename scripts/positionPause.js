 // ---- pause position -------//

 function PausePosition(){

 }

 PausePosition.prototype.draw = function(play){
     ctx.clearRect(0, 0, play.width, play.height);
     ctx.font = "40px Comic Sans MS";
     ctx.fillStyle = '#ffffff';
     ctx.textAlign = "center";
     ctx.fillText("Paused", play.width/2, play.height/2 - 300);

     ctx.font = "36px Comic Sans MS";
     ctx.fillStyle = '#D7DF01';
     ctx.fillText("P: Back to the current game", play.width/2, play.height/2 - 250);
     ctx.fillText("ESC: Quit the current game", play.width/2, play.height/2 - 210);

     ctx.font = "36px Comic Sans MS";
     ctx.fillStyle = '#D7DF01';
     ctx.fillText("Game Controls Reminder", play.width/2, play.height/2 - 120);
     ctx.fillStyle = '#ffffff';
     ctx.fillText("Left Arrow: Move Left", play.width/2, play.height/2 - 70);
     ctx.fillText("Right Arrow: Move Right", play.width/2, play.height/2 - 30);
     ctx.fillText("Spacebar: Fire!", play.width/2, play.height/2 + 10);

 }

 PausePosition.prototype.keyDown = function(play, keyboardCode){
    // hit p again to continue 
    if(keyboardCode == 80){
         play.popPosition();
     }
     // hit esc to start over
     if(keyboardCode == 27){
         play.pushPosition(new OpeningPosition());
     }

}