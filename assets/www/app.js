var canvas;

var width = 0;
var height = 0;

var frameRate = 25; // 25 frames each second

fishArray = new Array();

$(document).ready(function() {
	width = window.innerWidth;
	height = window.innerHeight;
 
	$("#canvas").attr("width", width);
	$("#canvas").attr("height", height);
	canvas = $("#canvas").get(0);
	
	if(canvas) {
		var query = window.location.search.substring(1);
		console.log(query);
		if (query.substring(0, 6) == "level=") {
			var jsFile = "levels/" + query.substring(6) + ".js";
			
			// include js file according to different levels
			var dynamicInclude = document.createElement("script");
			dynamicInclude.src = jsFile;
			dynamicInclude.type = "text/javascript";
			document.getElementsByTagName("head")[0].appendChild(dynamicInclude);

			// start game
			init();
		}
	}
});

function init() {
	frameCnt = 0;
	setInterval(draw, Math.ceil(1000 / frameRate));
}

function draw() {
	++frameCnt;
	// check if to add or delete fish
	fishManager();

	var ctx = canvas.getContext('2d');
	
	ctx.globalCompositeOperation = "destination-over";
	ctx.clearRect(0, 0, width, height);
	
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


