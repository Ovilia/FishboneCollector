$(document).ready(function() {
	width = window.innerWidth;
	height = window.innerHeight;
 
	$("#canvas").attr("width", width);
	$("#canvas").attr("height", height);
	var canvas = $("#canvas").get(0);
	
	if(canvas) {
		ctx = canvas.getContext('2d');
		
		// level information in local storage
		var level = window.localStorage.getItem("level");
		var script = document.createElement('script');
		script.src = "levels/teach" + level + ".js";
		script.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(script);
		init();
	}
});

function init() {
	fishArray = new Array();
	
	// height of sky
	skyHeight = 0;
	// height of shallow sea
	shallowHeight = 50;
	// height of deep sea is the rest
	
	energy = new EnergyManager();
	bubble = new BubbleManager();
	
	frameRate = 25; // 25 frames each second
	frameCnt = 0;
	setInterval(draw, Math.ceil(1000 / frameRate));
	
	document.addEventListener("deviceready", onDeviceReady, false);
	
	isPaused = false;
	isMousePressed = false;
	$('#canvas').mousedown(function(e) {
		isMousePressed = true;
		bubble.addBubble(e.pageX, e.pageY);
	});
	$('#canvas').mouseup(function(e) {
		isMousePressed = false;
		var len = bubble.bubbleArray.length;
		if (len > 0) {
			bubble.bubbleArray[len - 1]["active"] = false;
		}
	});
	$('#canvas').mousemove(function(e) {
		if (isMousePressed) {
			var len = bubble.bubbleArray.length;
			if (len > 0 && bubble.bubbleArray[len - 1]["active"] === true) {
				bubble.bubbleArray[len - 1]["x"] = e.pageX;
				bubble.bubbleArray[len - 1]["y"] = e.pageY;
			}
		}
	});
}

function draw() {
	++frameCnt;
	// check if to add or delete fish
	fishManager();
	
	ctx.clearRect(0, 0, width, height);
	
	// background of sky and sea
	// shallow sea
	ctx.fillStyle = "#8ED6FF";
	ctx.fillRect(0, 0, width, shallowHeight);
	// deep sea
	ctx.fillStyle = "#5483ca";
	ctx.fillRect(0, shallowHeight, width, height - shallowHeight);
	
	// energy ball
	ctx.drawImage(energy.image, 
		width - energy.image.width - 15, height - energy.image.height - 15,
		energy.image.width, energy.image.height);
		
	// bubble
	var len = bubble.bubbleArray.length;
	for (var i = 0; i < len; ++i) {
		var bWidth = bubble.bubbleArray[i]["energy"] * bubble.image.width;
		var bHeight = bubble.bubbleArray[i]["energy"] * bubble.image.height;
		ctx.drawImage(bubble.image,
			bubble.bubbleArray[i]["x"] - bWidth / 2, bubble.bubbleArray[i]["y"] - bHeight / 2,
			bWidth, bHeight);
			
		if (bubble.bubbleArray[i]["active"] === false) {
			// float up
			bubble.bubbleArray[i]["x"] += Math.random() * 10 - 5;
			bubble.bubbleArray[i]["y"] -= bubble.bubbleArray[i]["energy"] * 20;
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
			ctx.drawImage(fishArray[i].image, 
				fishArray[i].left, fishArray[i].top,
				fishArray[i].image.width, fishArray[i].image.height);
		
			if (fishArray[i].left < width) {
				fishArray[i].left += fishArray[i].speed;
			} else {
				delete fishArray[i];
				--i;
			}
		}
	}
}

function onDeviceReady() {
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
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
	this.top = Math.ceil(Math.random() * (height - this.image.height));
	this.size = size;
	this.speed = 20 / (size + 5);
	
}

function EnergyManager() {
	this.image = new Image();
	this.image.src = "images/energy.png";
}

function BubbleManager() {
	this.image = new Image();
	this.image.src = "images/bubble.png";
	
	this.bubbleArray = new Array();
	
	this.addBubble = function(x, y) {
		var bubble = {
			"x": x,
			"y": y,
			"energy": 1.0 / 6.0, 
			"active": true // those active ones can be enlarged
		};
		this.bubbleArray.push(bubble);
	};
	
	this.enlargeBubble = function() {
		// only the last one bubble can be active in bubbleArray
		var len = this.bubbleArray.length;
		if (this.bubbleArray[len - 1]["active"] === true) {
			this.bubbleArray[len - 1]["energy"] += 1.0 / 32.0;
		}
		if (this.bubbleArray[len - 1]["energy"] >= 1.0) {
			// energy is full
			this.bubbleArray[len - 1]["energy"] = 1.0;
		}
	};
}
