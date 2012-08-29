$(document).ready(function() {
	windowWidth = window.localStorage.getItem("windowWidth");
	windowHeight = window.localStorage.getItem("windowHeight");
	
 
	$("#canvas").attr("width", windowWidth).attr("height", windowHeight);
	var canvas = $("#canvas").get(0);
	
	if(canvas) {
		ctx = canvas.getContext('2d');
		
		// level information in local storage
		var level = window.localStorage.getItem("level");
		var script = document.createElement('script');
		script.src = "levels/teach" + level + ".js";
		script.type = 'text/javascript';
		$('head')[0].appendChild(script);
		init();
	}
});

function debug() {
	$('#canvas').mousedown(function(e) {
		isMousePressed = true;
		var x = e.pageX;
		var y = e.pageY;
		
		// check if touch within bubble
		var withinBbId = -1;
		var len = bubble.bubbleArray.length;
		for (var i = 0; i < len; ++i) {
			// not active
			if (bubble.bubbleArray[i] && bubble.bubbleArray[i].active === false &&
				// covering fish
				bubble.bubbleArray[i].fish.length > 0 &&
				// touch within bubble
				(Math.abs(bubble.bubbleArray[i].x - x) < bubble.bubbleArray[i].energy * bubble.image.width) &&
				(Math.abs(bubble.bubbleArray[i].y - y) < bubble.bubbleArray[i].energy * bubble.image.height)) {
					withinBbId = i;
					break;
			}
		}
		if (withinBbId == -1) {
			// not within bubble, add a bubble
			bubble.addBubble(x, y);
		} else {
			// touch within bubble will break the bubble
			bubble.breakBubble(withinBbId);
		}
	});
	$('#canvas').mouseup(function(e) {
		isMousePressed = false;
		var len = bubble.bubbleArray.length;
		if (len > 0 && bubble.bubbleArray[len - 1]) {
			bubble.bubbleArray[len - 1].active = false;
		}
	});
	$('#canvas').mousemove(function(e) {
		if (isMousePressed) {
			var len = bubble.bubbleArray.length;
			if (len > 0 && bubble.bubbleArray[len - 1] &&
					bubble.bubbleArray[len - 1].active === true) {
				bubble.bubbleArray[len - 1].x = e.pageX;
				bubble.bubbleArray[len - 1].y = e.pageY;
			}
		}
	});
	$(document).keypress(function(e) {
		if (e.which == 122) { // z to move left
			board.left -= 20;
			var max = windowWidth - board.image.width;
			if (board.left > max) {
				board.left = max;
			}
		} else if (e.which == 120) { // x to move right
			board.left += 20;
			if (board.left < 0) {
				board.left = 0;
			}
		}
	});
}

function init() {
	game = new GameManager();
	energy = new EnergyManager();
	bubble = new BubbleManager();
	board = new BoardManager();
	
	document.addEventListener('deviceready', onDeviceReady, false);
    
	isPaused = false;
	isMousePressed = false;
	
	// only for debug on web page
	debug();
	
	setInterval(draw, Math.ceil(1000 / game.frameRate));
}

function draw() {
	++game.frameCnt;
	// check if to add or delete fish
	fishManager();
	
	ctx.clearRect(0, 0, windowWidth, windowHeight);
	
	// background of sky and sea
	// shallow sea
	ctx.fillStyle = "#8ED6FF";
	ctx.fillRect(0, 0, windowWidth, game.shallowHeight);
	// deep sea
	ctx.fillStyle = "#5483ca";
	ctx.fillRect(0, game.shallowHeight, windowWidth, windowHeight - game.shallowHeight);
	
	// energy ball
	energy.draw();
	energy.addOrdEnergy();
	
	// board
	ctx.drawImage(board.image, board.left, board.top, board.image.width, board.image.height);
		
	// bubble
	var len = bubble.bubbleArray.length;
	for (var i = 0; i < len; ++i) {
		if (bubble.bubbleArray[i]) {
			// draw bubble
			var bWidth = bubble.bubbleArray[i].energy * bubble.image.width;
			var bHeight = bubble.bubbleArray[i].energy * bubble.image.height;
			ctx.drawImage(bubble.image,
				bubble.bubbleArray[i].x - bWidth / 2, bubble.bubbleArray[i].y - bHeight / 2,
				bWidth, bHeight);
			
			// move if is not active
			if (bubble.bubbleArray[i].active === false) {
				// float up
				bubble.bubbleArray[i].vy += bubble.bubbleArray[i].energy * 0.08;
				bubble.bubbleArray[i].y -= bubble.bubbleArray[i].vy;
				if (game.frameCnt % 3 == 0) {
					bubble.bubbleArray[i].vx = Math.random() * 10 - 5;
				}
				bubble.bubbleArray[i].x += bubble.bubbleArray[i].vx;
				
				// delete those outside of the screen
				if (bubble.bubbleArray[i].x < -bubble.image.width || 
					bubble.bubbleArray[i].x > windowWidth ||
					bubble.bubbleArray[i].y < -bubble.image.height || 
					bubble.bubbleArray[i].y > windowHeight) {
						delete bubble.bubbleArray[i];
                        continue;
				}
			}
			
			// check if is covering a fish
            var fLen = game.fishArray.length;
            for (var j = 0; j < fLen; ++j) {
	            if (game.fishArray[j] && game.fishArray[j].bubbleId == -1) {
	            	var left = game.fishArray[j].left;
	            	var right = left + game.fishArray[j].image.width;
	            	var top = game.fishArray[j].top;
	            	var bottom = top + game.fishArray[j].image.height;
	            	// tolerance
	            	left += game.fishArray[j].image.width / 10; 
	            	right -= game.fishArray[j].image.width / 10;
	            	top += game.fishArray[j].image.height / 10;
	            	bottom -= game.fishArray[j].image.height / 10;
	            	
	            	var bRadius = bubble.image.width * bubble.bubbleArray[i].energy / 2;
	            	var bLeft = bubble.bubbleArray[i].x - bRadius;
	            	var bRight = bubble.bubbleArray[i].x + bRadius;
	            	var bTop = bubble.bubbleArray[i].y - bRadius;
	            	var bBottom = bubble.bubbleArray[i].y + bRadius;
	            	
	            	if (bLeft < left && bTop < top && bRight > right && bBottom > bottom) {
                		game.fishArray[j].bubbleId = i;
                		bubble.bubbleArray[i].active = false;
                		bubble.bubbleArray[i].fish.push(j);
                		bubble.bubbleArray[i].vy = 0;
                    }
                }
            }
		}
	}
	// enlarge if mouse is pressed
	if (isMousePressed) {
		bubble.enlargeBubble();
	}
	
	// fish
	len = game.fishArray.length;
	for (var i = 0; i < len; ++i) {
		if (game.fishArray[i]) {
			game.fishArray[i].move();
            if (game.fishArray[i].bubbleId == -1) {
            	// move as not covered by bubble
			    if (game.fishArray[i].left > windowWidth) {
				    delete game.fishArray[i];
				    continue;
                }
			} else if (game.fishArray[i].isDropping) {
				// check if touches board
				if (game.fishArray[i].top + game.fishArray[i].image.height >= board.top &&
						game.fishArray[i].left > board.left && 
						game.fishArray[i].left + game.fishArray[i].image.width < board.left + board.image.width) {
					console.log("get one");
					delete game.fishArray[i];
					continue;
				} else if (game.fishArray[i].top > windowHeight) {
					// TODO: effect here
					console.log("miss one");
					delete game.fishArray[i];
					continue;
				}
			} else {
                // covered by bubble, move with bubble
                var id = game.fishArray[i].bubbleId;
                var bb = bubble.bubbleArray[id];
                if (bb) {
	                game.fishArray[i].left = bb.x - game.fishArray[i].image.width / 2;
	                game.fishArray[i].top = bb.y - game.fishArray[i].image.height / 2;
	                
	                // change to be bone
	                game.fishArray[i].toBone();
	            }
            }
            var width = game.fishArray[i].image.width;
            var height = game.fishArray[i].image.height;
            var left = game.fishArray[i].left;
            var top = game.fishArray[i].top;
            var boneWidth = width * game.fishArray[i].bonePercent;
            if (game.fishArray[i].isAllFish) {
            	// draw fish
				ctx.drawImage(game.fishArray[i].image, left, top, width, height);
			} else if (game.fishArray[i].isAllBone) {
				// draw bone
				ctx.drawImage(SmallFish.prototype.boneImage, left, top, boneWidth, height);
			} else {
				// draw fish and bone
				ctx.drawImage(SmallFish.prototype.boneImage, 
					0, 0, SmallFish.prototype.boneImage.width * game.fishArray[i].bonePercent, 
					SmallFish.prototype.boneImage.height, left, top, boneWidth, height);
				ctx.drawImage(game.fishArray[i].image, 
					boneWidth, 0, width - boneWidth, height, left + boneWidth, 
					top, width - boneWidth, height);
			}
		}
	}
}

function onDeviceReady() {
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	
	document.addEventListener("touchstart", function(e){
		e.preventDefault();
		isMousePressed = true;
		var x = e.changedTouches[0].pageX;
		var y = e.changedTouches[0].pageY;
		
		// check if touch within bubble
		var withinBbId = -1;
		var len = bubble.bubbleArray.length;
		for (var i = 0; i < len; ++i) {
			// not active
			if (bubble.bubbleArray[i] && bubble.bubbleArray[i].active === false &&
				// covering fish
				bubble.bubbleArray[i].fish.length > 0 &&
				// touch within bubble
				(Math.abs(bubble.bubbleArray[i].x - x) < bubble.bubbleArray[i].energy * bubble.image.width) &&
				(Math.abs(bubble.bubbleArray[i].y - y) < bubble.bubbleArray[i].energy * bubble.image.height)) {
					withinBbId = i;
					break;
			}
		}
		if (withinBbId == -1) {
			// not within bubble, add a bubble
			bubble.addBubble(x, y);
		} else {
			// touch within bubble will break the bubble
			bubble.breakBubble(withinBbId);
		}
	}, false);
    document.addEventListener('touchmove', function(e) {
		if (isMousePressed) {
			var len = bubble.bubbleArray.length;
			if (len > 0 && bubble.bubbleArray[len - 1] &&
					bubble.bubbleArray[len - 1].active === true) {
				bubble.bubbleArray[len - 1].x = e.changedTouches[0].pageX;
				bubble.bubbleArray[len - 1].y = e.changedTouches[0].pageY;
			}
		}
    }, false);
    document.addEventListener('touchend', function(e) {
		isMousePressed = false;
		var len = bubble.bubbleArray.length;
		if (len > 0 && bubble.bubbleArray[len - 1]) {
			bubble.bubbleArray[len - 1].active = false;
		}
    }, false);
}

function onPause() {
	isPaused = true;
}

function onResume() {
	isPaused = false;
}

/*
 * Definition of classes
 */
function SmallFish(size) {
	this.image = new Image();
	this.image.src = "images/fish01-" + size + ".png"
	
	this.left = 0 - this.image.width;
	this.top = Math.ceil(Math.random() * (windowHeight - this.image.height));
	this.size = size;
	this.vx = 20 / (size + 5);
	this.vy = 0;
	this.ay = 0;
	
	// if covered by a bubble, bubbleId is the index in bubbleArray
	// if not, bubbleId is -1
	this.bubbleId = -1;
	
	// 0 if is fish, 1 if is bone
	this.bonePercent = 0;
	this.isAllFish = true;
	this.isAllBone = false;
	this.toBone = function() {
		this.isAllFish = false;
		if (this.isAllBone === false) {
			this.bonePercent += 0.5 / (size + 10);
			if (this.bonePercent >= 1.0) {
				this.bonePercent = 1.0;
				this.isAllBone = true;
			}
		}
	};
	
	// drop when touched after become bone
	this.isDropping = false;
	this.startDrop = function() {
		this.isDropping = true;
		this.vx = 0;
		this.vy = 4.0;
		this.ay = -0.2;
	}
	
	this.floatUp = function() {
		this.vx = 0;
		this.vy = 4.0;
		this.ay = 0.2;
	}
	
	this.move = function() {
		this.vy += this.ay;
		this.left += this.vx;
		this.top -= this.vy;
	}
}
SmallFish.prototype.boneImage = new Image();
SmallFish.prototype.boneImage.src = "images/fishbone.png";



function GameManager() {
	this.frameRate = 25; // 25 frames each second
	this.frameCnt = 0;
	
	this.fishArray = [];
	this.fishTotal = 0;
	
	// height of sky
	this.skyHeight = 0;
	// height of shallow sea
	this.shallowHeight = 20;
	// height of deep sea is the rest
	
}
 
 
 
function EnergyManager() {
	this.margin = 15;
	this.radius = 50;
	this.innerRadius = 25;
	this.left = windowWidth - this.radius * 2 - this.margin;
	this.top = this.margin;
	this.centerX = this.left + this.radius;
	this.centerY = this.top + this.radius;
	
	this.ordEnergy = 1.0 / 3.0;
	
	this.addOrdEnergy = function() {
		this.ordEnergy += 0.1 / 20.0;
		if (this.ordEnergy > 1.0) {
			this.ordEnergy = 1.0;
		}
	};
	
	this.color = ["#ff0000", "#ff6347", "#ff8c00", "#ffd700",
				  "#ffff00", "#d8ff00", "#96ff00", "#00ff36"];
	this.draw = function() {
		ctx.drawImage(this.image, this.left, this.top,
			this.image.width, this.image.height);
		ctx.fillStyle = this.color[Math.ceil(this.ordEnergy * (this.color.length - 1))];
		ctx.beginPath();
		ctx.moveTo(this.centerX, this.centerY);
		ctx.arc(this.centerX, this.centerY, this.innerRadius,
			-0.5 * Math.PI, 2 * Math.PI * this.ordEnergy - 0.5 * Math.PI);
		ctx.lineTo(this.centerX, this.centerY);
		ctx.closePath();
		ctx.fill();
	}
}
EnergyManager.prototype.image = new Image();
EnergyManager.prototype.image.src = "images/energy.png";



function BubbleManager() {
	this.bubbleArray = new Array();
	
	this.addBubble = function(x, y) {
		var delta = 1.0 / 6.0;
		if (energy.ordEnergy > delta) {
			var newBubble = {
				"x": x, // x and y is the center of bubble
				"y": y,
				"vx": 0,
				"vy": 0,
				"energy": delta, // 0.0 to 1.0
				"active": true, // those active ones can be enlarged
				"fish": [] // covered fish
			};
			this.bubbleArray.push(newBubble);
			energy.ordEnergy -= delta;
		}
	};
	
	this.enlargeBubble = function() {
		// only the last one bubble can be active in bubbleArray
		var len = this.bubbleArray.length;
		if (this.bubbleArray[len - 1]) {
			if (this.bubbleArray[len - 1].active === true) {
				var delta = 1.0 / 32.0;
				if (energy.ordEnergy - delta < 0.0) {
					delta = energy.ordEnergy;
				}
				this.bubbleArray[len - 1].energy += delta;
				energy.ordEnergy -= delta;
			}
			if (this.bubbleArray[len - 1].energy >= 1.0) {
				// energy is full
				this.bubbleArray[len - 1].energy = 1.0;
			}
		}
	};
	
	this.breakBubble = function(index) {
		if (index < this.bubbleArray.length && this.bubbleArray[index]) {
			var b = this.bubbleArray[index];
			var fLen = b.fish.length;
			for (var i = 0; i < fLen; ++i) {
				if (game.fishArray[b.fish[i]]) {
					if (game.fishArray[b.fish[i]].isAllBone) {
						game.fishArray[b.fish[i]].startDrop();
					} else {
						// fish that is not all bone will still float up
						game.fishArray[b.fish[i]].floatUp();
					}
				}
			}
			delete this.bubbleArray[index];
		}
	};
}
BubbleManager.prototype.image = new Image();
BubbleManager.prototype.image.src = "images/bubble.png";



function BoardManager() {
}
BoardManager.prototype.image = new Image();
BoardManager.prototype.image.onload = function() {
	BoardManager.prototype.marginBottom = 20;
	BoardManager.prototype.top = windowHeight - 
		BoardManager.prototype.image.height - BoardManager.prototype.marginBottom;
	BoardManager.prototype.left = Math.ceil((windowWidth - BoardManager.prototype.image.width) / 2);
}
BoardManager.prototype.image.src = "images/board.png";


	