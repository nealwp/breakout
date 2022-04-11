var canvas = document.getElementById("myCanvas");
var canvasContext = canvas.getContext("2d");
const SLOW = 3;
const MEDIUM = 4.2;
const FAST = 5.88;
const VERY_FAST = 8.32;
var speed = SLOW;
var ballRadius = 8;
var paddleHeight = 15;
var paddleWidth = 75;
var rightPressed = false;
var leftPressed = false;
var paddleX = (canvas.width-paddleWidth)/2
var brickRowCount = 8;
var brickColumnCount = 14;
var brickWidth = 55;
var brickHeight = 15;
var brickPadding = 3;
var brickOffsetTop = 100;
var brickOffsetLeft = 0;
var x = canvas.width/2;
var y = canvas.height-30;
var dx = SLOW;
var dy = -SLOW;
var score = 0;
var lives = 3;
var touched = false; 
var touchX;
var touchY;

function Channel(audio_uri) {
	this.audio_uri = audio_uri;
	this.resource = new Audio(audio_uri);
}


function Switcher(audio_uri, num) {
	this.channels = [];
	this.num = num;
	this.index = 0;

	for (var i = 0; i < num; i++) {
		this.channels.push(new Channel(audio_uri));
	}
}

Switcher.prototype.play = function() {
	this.channels[this.index++].play();
	this.index = this.index < this.num ? this.index : 0;
}

Channel.prototype.play = function() {
	// Try refreshing the resource altogether
	this.resource.play();
}

Sound = (function() {
    var self = {};
    
	self.init = function() {
        sfx_paddleHit  = new Switcher('../sound/paddle_hit.wav', 10);
        sfx_brickHit = new Switcher('../sound/brick_hit2.wav', 20);
	}

	return self;
}());

var bricks = [];
for(var c = 0; c < brickColumnCount; c++){
    bricks[c] = [];
    for(var r = 0; r<brickRowCount; r++){
        bricks[c][r] = {x: 0, y:0, status: 1, row: r};
    }
}

canvasContext.beginPath();
canvasContext.rect(20, 40, 50, 50);
canvasContext.fillStyle = "#000000";
canvasContext.fill();
canvasContext.closePath();

canvasContext.beginPath();
canvasContext.arc(240, 160, 20, 0, Math.PI*2, false);
canvasContext.fillStyle = "green";
canvasContext.fill();
canvasContext.closePath();

canvasContext.beginPath();
canvasContext.rect(160, 10, 100, 40);
canvasContext.strokeStyle = "rgba(0, 0, 255, 0.5)";
canvasContext.stroke();
canvasContext.closePath();

function drawBall(){
    canvasContext.beginPath();
    canvasContext.rect(x, y, 8, 8);
    canvasContext.fillStyle = "#FFFFFF";
    canvasContext.fill();
    canvasContext.closePath();
}

function drawPaddle(){
    canvasContext.beginPath();
    canvasContext.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    canvasContext.fillStyle = "#0095DD";
    canvasContext.fill();
    canvasContext.closePath();

}

function drawBricks(){
    for(var c = 0; c<brickColumnCount; c++){
        for(var r = 0; r < brickRowCount; r++){
            if(bricks[c][r].status == 1){
                var brickX = (c*(brickWidth+brickPadding)) + brickOffsetLeft;
                var brickY = (r*(brickHeight+brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                canvasContext.beginPath()
                canvasContext.rect(brickX, brickY, brickWidth, brickHeight);
                if(r < 2){
                    canvasContext.fillStyle = "red";
                } else if (r < 4){
                    canvasContext.fillStyle = "orange";
                } else if (r < 6){
                    canvasContext.fillStyle = "green";
                } else if (r < 8){
                    canvasContext.fillStyle = "yellow";
                }

                canvasContext.fill();
                canvasContext.closePath();
            }
        }
    }
}

function drawScore(){
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Score: "+ score, canvas.width/3, 30);
}

function collisionDetection(){
    for (var c = 0; c<brickColumnCount; c++){
        for(var r = 0; r< brickRowCount; r++){
            var b = bricks[c][r];
            if (b.status == 1){
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight){
                    dy = -dy;
                    sfx_brickHit.play();
                    b.status = 0;
                    if (b.row == 7 || b.row == 6){
                        score++;
                    }else if (b.row == 5 || b.row == 4){
                        score = score + 3;
                        if (speed < MEDIUM){
                            speed = MEDIUM;
                            dy = dy*1.4;
                        }
                    }else if (b.row == 3 || b.row == 2){
                        score = score + 5;
                        if (speed < FAST){
                            speed = FAST;
                            dy = dy*1.4;
                        }
                    } else if (b.row == 1 || b.row == 0){
                        score = score + 7;
                        if(paddleWidth >= 55 && b.row == 0){
                            paddleWidth = paddleWidth/2;
                        }
                        if (speed < VERY_FAST){
                            speed = VERY_FAST;
                            dy = dy*1.4;
                        }
                    }
                    if(score == 448){
                        alert("YOU WIN, CONGRATS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function draw(){
    canvasContext.clearRect(0,0, canvas.width, canvas.height)
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();
    x += dx;
    y += dy;

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius){
        dx = -dx;
        sfx_paddleHit.play();
    }
    
    if(y + dy < ballRadius){
        dy = -dy;
    } else if(y + dy > canvas.height - ballRadius){
        if (x > paddleX && x < paddleX + paddleWidth){
            dy = -dy;
            sfx_paddleHit.play();
        }
        else {
            //alert("GAME OVER");
            document.location.reload();
            clearInterval(interval);
        }
    }


    if(rightPressed){
        paddleX += 7;
        if (paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }
    }
    else if (leftPressed){
        paddleX -= 7;
        if (paddleX < 0){
            paddleX = 0;
        }
    }

    requestAnimationFrame(draw);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchstart", touchStartHandler, true);
document.addEventListener("touchmove", touchMoveHandler, true);
document.addEventListener("pointerup", function(){touched = false;}, false);
document.addEventListener("pointermove", pointerMoveHandler, false);

function keyDownHandler(e) {
    if (e.key == "d" || e.key == "D"){
        rightPressed = true;
    }
    else if (e.key == "a" || e.key == "A"){
        leftPressed = true;
    }
}

function keyUpHandler(e){
    if(e.key == "d" || e.key == "D"){
        rightPressed = false;
    }
    else if (e.key == "a" || e.key == "A"){
        leftPressed = false;
    }
}

function mouseMoveHandler(e){
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width){
        paddleX = relativeX - paddleWidth/2;
    }
}

function pointerMoveHandler(e){
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width){
        paddleX = relativeX - paddleWidth/2;
    }
}

function touchStartHandler(){
    getTouchPos();
    if(touchX > 0 && touchX < canvas.width){
        paddleX = touchX - paddleWidth/2;
    }

    //event.preventDefault();

}

function getTouchPos(e){
    if (!e)
        var e = event;

    if (e.touches){
        if (e.touches.length == 1){
            var touch = e.touches[0];
            touchX = touch.pageX-touch.target.offsetLeft;
            touchY = touch.pageY-touch.target.offsetTop;
        }
    }
}

function touchMoveHandler(e){
    getTouchPos(e);
    
    if(touchX > 0 && touchX < canvas.width){
        paddleX = touchX - paddleWidth/2;
    }

    //event.preventDefault();

}
Sound.init();
draw();



