function initHome() {
	var canvas = $("#homeCanvas").get(0);
	
	if(canvas) {
		ctx = canvas.getContext('2d');
		
		home = new HomeManager();
		
		setInterval(drawHome, Math.ceil(1000 / fcGlobal.frameRate));
		fcGlobal.frameCnt = 0;
	}
}

function homeTouchStart(e) {
	home.isTouched = true;
	if (e.changedTouches) {
		var x = e.changedTouches[0].pageX;
		var y = e.changedTouches[0].pageY;
	} else {
		// debug on web page
		var x = e.pageX;
		var y = e.pageY;
	}
	var withinBbId = -1;
	var len = home.bubbleArray.length;
	for (var i = 0; i < len; ++i) {
		// not active
		if (home.bubbleArray[i] && home.bubbleArray[i].active === false &&
			// touch within bubble
			(Math.abs(home.bubbleArray[i].x - x) < home.bubbleArray[i].energy * home.bubbleImg.width) &&
			(Math.abs(home.bubbleArray[i].y - y) < home.bubbleArray[i].energy * home.bubbleImg.height)) {
				withinBbId = i;
				break;
		}
	}
	if (withinBbId == -1) {
		// not within bubble, add a bubble
		home.addBubble(x, y);
	}
}

function homeTouchMove(e) {
	if (home.isTouched) {
		if (e.changedTouches) {
			var x = e.changedTouches[0].pageX;
			var y = e.changedTouches[0].pageY;
		} else {
			// debug on web page
			var x = e.pageX;
			var y = e.pageY;
		}
		var len = home.bubbleArray.length;
		if (len > 0 && home.bubbleArray[len - 1] &&
				home.bubbleArray[len - 1].active === true) {
			home.bubbleArray[len - 1].x = x;
			home.bubbleArray[len - 1].y = y;
		}
	}
}

function homeTouchEnd(e) {
	home.isTouched = false;
	var len = home.bubbleArray.length;
	if (len > 0 && home.bubbleArray[len - 1]) {
		home.bubbleArray[len - 1].active = false;
	}
}

function drawHome() {
	ctx.clearRect(0, 0, fcGlobal.windowWidth, fcGlobal.windowHeight);
	++fcGlobal.frameCnt;
	
	ctx.fillStyle = "#8ED6FF";
	ctx.fillRect(0, 0, fcGlobal.windowWidth, fcGlobal.windowHeight);
	
	home.drawBubble();
	
	var len = home.bubbleArray.length;
	for (var i = 0; i < len; ++i) {
		// move if is not active
		if (home.bubbleArray[i] && home.bubbleArray[i].active === false) {
			// float up
			home.bubbleArray[i].vy += home.bubbleArray[i].energy * 0.08;
			home.bubbleArray[i].y -= home.bubbleArray[i].vy;
			if (fcGlobal.frameCnt % 3 == 0) {
				home.bubbleArray[i].vx = Math.random() * 6 - 3;
			}
			home.bubbleArray[i].x += home.bubbleArray[i].vx;
			
			// delete those outside of the screen
			if (home.bubbleArray[i].x < -home.bubbleImg.width || 
				home.bubbleArray[i].x - home.bubbleImg.width > fcGlobal.windowWidth ||
				home.bubbleArray[i].y < -home.bubbleImg.height || 
				home.bubbleArray[i].y - home.bubbleImg.height > fcGlobal.windowHeight) {
					delete home.bubbleArray[i];
	                continue;
			}
		}
	}
	
	if (home.isTouched) {
		home.enlargeBubble();
	}
}



function HomeManager() {
	this.isTouched = false;
	
	this.bubbleArray = [];
	this.addBubble = function(x, y) {
		var newBubble = {
			"x": x, // x and y is the center of bubble
			"y": y,
			"vx": 0,
			"vy": 0,
			"energy": 0.25, // 0.0 to 1.0
			"active": true // those active ones can be enlarged
		};
		this.bubbleArray.push(newBubble);
	};
	this.enlargeBubble = function() {
		// only the last one bubble can be active in bubbleArray
		var len = this.bubbleArray.length;
		if (this.bubbleArray[len - 1]) {
			if (this.bubbleArray[len - 1].active === true) {
				var delta = 1.0 / 32.0;
				this.bubbleArray[len - 1].energy += delta;
			}
			if (this.bubbleArray[len - 1].energy >= 1.0) {
				// energy is full
				this.bubbleArray[len - 1].energy = 1.0;
			}
		}
	};
	this.drawBubble = function() {
		var len = this.bubbleArray.length;
		for (var i = 0; i < len; ++i) {
			if (this.bubbleArray[i]) {
				var bWidth = this.bubbleArray[i].energy * this.bubbleImg.width;
				var bHeight = this.bubbleArray[i].energy * this.bubbleImg.height;
				ctx.drawImage(this.bubbleImg,
					this.bubbleArray[i].x - bWidth / 2, this.bubbleArray[i].y - bHeight / 2,
					bWidth, bHeight);
			}
		}
	}
}
HomeManager.prototype.bubbleImg = new Image();
HomeManager.prototype.bubbleImg.src = "images/bubble.png";

