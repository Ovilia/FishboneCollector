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

function init() {
	frameRate = 25; // 25 frames each second
	frameCnt = 0;
	
	fishArray = new Array();
	
	// height of sky
	skyHeight = 0;
	// height of shallow sea
	shallowHeight = 20;
	// height of deep sea is the rest
	
	energy = new EnergyManager();
	bubble = new BubbleManager();
	
	document.addEventListener('deviceready', onDeviceReady, false);
    
	isPaused = false;
	isMousePressed = false;
	
	// only for debug on web page
	$('#canvas').mousedown(function(e) {
		isMousePressed = true;
		bubble.addBubble(e.pageX, e.pageY);
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
	
	setInterval(draw, Math.ceil(1000 / frameRate));
}

function draw() {
	++frameCnt;
	// check if to add or delete fish
	fishManager();
	
	ctx.clearRect(0, 0, windowWidth, windowHeight);
	
	// background of sky and sea
	// shallow sea
	ctx.fillStyle = "#8ED6FF";
	ctx.fillRect(0, 0, windowWidth, shallowHeight);
	// deep sea
	ctx.fillStyle = "#5483ca";
	ctx.fillRect(0, shallowHeight, windowWidth, windowHeight - shallowHeight);
	
	// energy ball
	energy.draw();
	energy.addOrdEnergy();
		
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
				bubble.bubbleArray[i].vy += bubble.bubbleArray[i].energy; 
				bubble.bubbleArray[i].y -= bubble.bubbleArray[i].vy;
				if (frameCnt % 3 == 0) {
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
            var fLen = fishArray.length;
            for (var j = 0; j < fLen; ++j) {
	            if (fishArray[j] && fishArray[j].bubbleId == -1) {
	            	var left = fishArray[j].left;
	            	var right = left + fishArray[j].image.width;
	            	var top = fishArray[j].top;
	            	var bottom = top + fishArray[j].image.height;
	            	// tolerance
	            	left += fishArray[j].image.width / 10; 
	            	right -= fishArray[j].image.width / 10;
	            	top += fishArray[j].image.height / 10;
	            	bottom -= fishArray[j].image.height / 10;
	            	
	            	var bRadius = bubble.image.width * bubble.bubbleArray[i].energy / 2;
	            	var bLeft = bubble.bubbleArray[i].x - bRadius;
	            	var bRight = bubble.bubbleArray[i].x + bRadius;
	            	var bTop = bubble.bubbleArray[i].y - bRadius;
	            	var bBottom = bubble.bubbleArray[i].y + bRadius;
	            	
	            	if (bLeft < left && bTop < top && bRight > right && bBottom > bottom) {
                		fishArray[j].bubbleId = i;
                		bubble.bubbleArray[i].active = false;
                		break;
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
	len = fishArray.length;
	for (var i = 0; i < len; ++i) {
		if (fishArray[i]) {
            if (fishArray[i].bubbleId == -1) {
			    if (fishArray[i].left < windowWidth) {
				    fishArray[i].left += fishArray[i].speed;
			    } else {
				    delete fishArray[i];
				    --i;
				    continue;
                }
			} else {
                // covered by bubble, move with bubble
                var id = fishArray[i].bubbleId;
                var bb = bubble.bubbleArray[id];
                if (bb) {
	                fishArray[i].left = bb.x - fishArray[i].image.width / 2;
	                fishArray[i].top = bb.y - fishArray[i].image.height / 2;
	            }
            }
			ctx.drawImage(fishArray[i].image, 
				fishArray[i].left, fishArray[i].top,
				fishArray[i].image.width, fishArray[i].image.height);
		}
	}
}

function onDeviceReady() {
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	
	document.addEventListener("touchstart", function(e){
		e.preventDefault();
		isMousePressed = true;
		bubble.addBubble(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
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
	this.speed = 20 / (size + 5);
	
	// if covered by a bubble, bubbleId is the index in bubbleArray
	// if not, bubbleId is -1
	this.bubbleId = -1;
}

function EnergyManager() {
	this.image = new Image();
	this.image.src = "images/energy.png";
	
	this.margin = 15;
	this.radius = 50;
	this.innerRadius = 25;
	this.left = windowWidth - this.radius * 2 - this.margin;
	this.top = windowHeight - this.radius * 2 - this.margin;
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

function BubbleManager() {
	this.image = new Image();
	this.image.src = "images/bubble.png";
	
	this.bubbleArray = new Array();
	
	this.addBubble = function(x, y) {
		var delta = 1.0 / 6.0;
		if (energy.ordEnergy > delta) {
			var newBubble = {
				"x": x, // x and y is the center of bubble
				"y": y,
				"vx": 0,
				"vy": 0,
				"energy": delta, 
				"active": true // those active ones can be enlarged
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
}
