var canvas;

var width = 0;
var height = 0;

var frameRate = 25; // 25 frames each second

fishArray = new Array();

// height of sky
skyHeight = 0;
// height of shallow sea
shallowHeight = 20;
// height of deep sea is the rest

$(document).ready(function() {
	width = window.innerWidth;
	height = window.innerHeight;
 
	$("#canvas").attr("width", width);
	$("#canvas").attr("height", height);
	canvas = $("#canvas").get(0);
	
	if(canvas) {
		// level information in cookie
		var level = window.localStorage.getItem("level");
		var script = document.createElement('script');
		script.src = "levels/teach" + level + ".js";
		script.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(script);
		init();
	}
});

function init() {
	energy = new EnergyManager();

	frameCnt = 0;
	setInterval(draw, Math.ceil(1000 / frameRate));
}

function draw() {
	++frameCnt;
	// check if to add or delete fish
	fishManager();

	var ctx = canvas.getContext('2d');
	
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
	
	var len = fishArray.length;
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

