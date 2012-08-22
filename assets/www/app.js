var canvas;

var width = 0;
var height = 0;

fishArray = new Array();

$(document).ready(function() {
	width = $(window).width();
	height = $(window).height();
 
	$("#canvas").attr("width", width);
	$("#canvas").attr("height", height);
	canvas = $("#canvas").get(0);
	
	if(canvas)
	{
		init();
	}
});

function init() {
	createFish();
	setInterval(draw, 100);
}

var drawTimes = 0;
function draw() {
	drawTimes += 1;
	if (drawTimes > 30) {
		createFish();
		drawTimes = 0;
	}
	
	var ctx = canvas.getContext('2d');
	
	ctx.globalCompositeOperation = "destination-over";
	ctx.clearRect(0, 0, width, height);
	
	var len = fishArray.length;
	for (var i = 0; i < len; ++i) {
		if (fishArray[i]) {
			ctx.drawImage(fishArray[i].image, 
				fishArray[i].left, fishArray[i].top,
				fishArray[i].width, fishArray[i].height);
		
			if (fishArray[i].left < width) {
				fishArray[i].left += Math.ceil(Math.random() * 20);
			} else {
				delete fishArray[i];
				--i;
				--len;
			}
		}
	}
}

function createFish() {
	var fish = new SmallFish("red");
	fish.top = Math.ceil(Math.random() * height);
	fishArray.push(fish);
}

/*
 * Definition of classes
 */
function Fish(imageSrc) {
	this.image = new Image();
	this.image.src = imageSrc;
	
	this.width = this.image.width;
	this.height = this.image.height;
	this.left = 0;
	this.top = 0;
}

function SmallFish(color) {
	this.color = color;
}
SmallFish.prototype = new Fish("images/fish01.png");


