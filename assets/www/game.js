function initGame() {
	var canvas = $("#gameCanvas").get(0);
	
	if(canvas) {
		ctx = canvas.getContext('2d');
		
		// level information in local storage
		var level = 1;//window.localStorage.getItem("level");
		var script = document.createElement('script');
		script.src = "levels/teach" + level + ".js";
		script.type = 'text/javascript';
		$('head')[0].appendChild(script);
	
		game = new GameManager();
		energy = new EnergyManager();
		bubble = new BubbleManager();
		board = new BoardManager();
		accelerator = new AcceleratorManager();
		score = new ScoreManager();
		prompt = new PromptManager();
		
		setInterval(drawGame, Math.ceil(1000 / fcGlobal.frameRate));
		fcGlobal.frameCnt = 0;
	}
}

function gameTouchStart(e) {
	game.isTouched = true;
	if (e.changedTouches) {
		var x = e.changedTouches[0].pageX;
		var y = e.changedTouches[0].pageY;
	} else {
		// debug on web page
		var x = e.pageX;
		var y = e.pageY;
	}
	
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
}

function gameTouchMove(e) {
	if (game.isTouched) {
		var len = bubble.bubbleArray.length;
		if (len > 0 && bubble.bubbleArray[len - 1] &&
				bubble.bubbleArray[len - 1].active === true) {
			bubble.bubbleArray[len - 1].x = e.changedTouches[0].pageX;
			bubble.bubbleArray[len - 1].y = e.changedTouches[0].pageY;
		}
	}
}

function gameTouchEnd(e) {
	game.isTouched = false;
	var len = bubble.bubbleArray.length;
	if (len > 0 && bubble.bubbleArray[len - 1]) {
		bubble.bubbleArray[len - 1].active = false;
	}
}

function drawGame() {
	ctx.clearRect(0, 0, fcGlobal.windowWidth, fcGlobal.windowHeight);
	++fcGlobal.frameCnt;
	
	// check if to add or delete fish
	fishManager();
	
	// background of sky and sea
	// shallow sea
	ctx.fillStyle = "#8ED6FF";
	ctx.fillRect(0, 0, fcGlobal.windowWidth, game.shallowHeight);
	// deep sea
	ctx.fillStyle = "#5483ca";
	ctx.fillRect(0, game.shallowHeight, fcGlobal.windowWidth, fcGlobal.windowHeight - game.shallowHeight);
	
	// energy ball
	energy.addOrdEnergy();
	energy.draw();
		
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
				if (fcGlobal.frameCnt % 3 == 0) {
					bubble.bubbleArray[i].vx = Math.random() * 6 - 3;
				}
				bubble.bubbleArray[i].x += bubble.bubbleArray[i].vx;
				
				// delete those outside of the screen
				if (bubble.bubbleArray[i].x < -bubble.image.width || 
					bubble.bubbleArray[i].x - bubble.image.width > fcGlobal.windowWidth ||
					bubble.bubbleArray[i].y < -bubble.image.height || 
					bubble.bubbleArray[i].y - bubble.image.height > fcGlobal.windowHeight) {
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
                		
                		score.bubbleFish(game.fishArray[j].left, game.fishArray[j].top);
                    }
                }
            }
		}
	}
	// enlarge if mouse is pressed
	if (game.isTouched) {
		bubble.enlargeBubble();
	}
	
	// fish
	len = game.fishArray.length;
	for (var i = 0; i < len; ++i) {
		if (game.fishArray[i]) {
			game.fishArray[i].move();
            if (game.fishArray[i].bubbleId == -1) {
            	// move as not covered by bubble
			    if (game.fishArray[i].left > fcGlobal.windowWidth) {
			    	if (game.fishArray[i].bubbleId == -1) {
			    		score.missedFish(game.fishArray[i].left, game.fishArray[i].top);
			    	}
				    delete game.fishArray[i];
				    continue;
                }
			} else if (game.fishArray[i].isDropping) {
				// check if touches board
				if (game.fishArray[i].top + game.fishArray[i].image.height >= 
						board.top + (board.boardHeight - board.thickness) / 2.0 &&
						game.fishArray[i].left > board.left && 
						game.fishArray[i].left + game.fishArray[i].image.width < board.left + board.boardWidth) {
					score.collectFish(game.fishArray[i].size, game.fishArray[i].left, game.fishArray[i].top);
					delete game.fishArray[i];
					continue;
				} else if (game.fishArray[i].top > fcGlobal.windowHeight) {
					// TODO: effect here
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
	
	// board
	board.move();
	board.draw();
	
	score.draw();
	prompt.draw();
}

/*
 * Definition of classes
 */
function SmallFish(size) {
	this.image = new Image();
	this.image.src = "images/fish01-" + size + ".png"
	
	this.left = 0 - this.image.width;
	this.top = Math.ceil(Math.random() * (fcGlobal.windowHeight - this.image.height - 200)) + 100;
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
		this.ay = -0.2;
	}
	
	this.floatUp = function() {
		this.vx = 0;
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
	this.fishArray = [];
	this.fishTotal = 0;
	
	// height of sky
	this.skyHeight = 0;
	// height of shallow sea
	this.shallowHeight = 20;
	// height of deep sea is the rest
	
	this.isTouched = false;
}



function ModeManager(modeType) {
	this.type = modeType;
}
ModeManager.prototype.ClassicMode = 0;
ModeManager.prototype.ZenMode = 1;
ModeManager.prototype.exec = function() {
	if (this.type == ModeManager.prototype.ClassicMode) {
		ModeManager.prototype.ClassicFunction();
	} else if (this.type == ModeManager.prototype.ZenMode) {
		ModeManager.prototype.ZenFunction();
	}
};
ModeManager.prototype.ClassicFunction = function() {
	
};
ModeManager.prototype.ZenFunction = function() {
	
}
 
 
 
function EnergyManager() {
	this.margin = 10;
	this.radius = 50;
	this.innerRadius = 25;
	this.left = fcGlobal.windowWidth - this.radius * 2 - this.margin;
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
	
	this.draw = function() {
		ctx.drawImage(this.image, this.left, this.top,
			this.image.width, this.image.height);
		ctx.fillStyle = "hsl(" + Math.floor(this.ordEnergy * 90) + ", 50%, 50%)";
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
			var dropCnt = 0;
			for (var i = 0; i < fLen; ++i) {
				game.fishArray[b.fish[i]].vy = b.vy;
				if (game.fishArray[b.fish[i]]) {
					if (game.fishArray[b.fish[i]].isAllBone) {
						game.fishArray[b.fish[i]].startDrop();
						dropCnt += 1;
					} else {
						// fish that is not all bone will still float up
						game.fishArray[b.fish[i]].floatUp();
						score.floatFish(game.fishArray[b.fish[i]].left, game.fishArray[b.fish[i]].top);
					}
				}
			}
			score.breakFishBubble(dropCnt, this.bubbleArray[index].x, this.bubbleArray[index].y);
			delete this.bubbleArray[index];
		}
	};
}
BubbleManager.prototype.image = new Image();
BubbleManager.prototype.image.src = "images/bubble.png";



function BoardManager() {
	this.boardWidth = 200; // contain head part
	this.boardHeight = 50;
	this.thickness = 10;
	this.left = Math.ceil((fcGlobal.windowWidth - this.boardWidth) / 2);
	
	this.vx = 0;
	
	this.move = function() {
		this.left += this.vx;
		if (this.left < 0) {
			this.left = 0;
		} else if (this.left > fcGlobal.windowWidth - this.boardWidth) {
			this.left = fcGlobal.windowWidth - this.boardWidth;
		}
		
		// resistance force
		if (Math.abs(this.vx) < 0.01) {
			this.vx = 0;
		} else {
			this.vx *= 0.9;
		}
	}
	
	this.draw = function() {
		// head
		ctx.beginPath();
		ctx.arc(this.left + this.headRadius, this.top + this.headRadius,
			    this.headRadius, 0, 2 * Math.PI, false);
		ctx.fillStyle = "hsl(" + (fcGlobal.frameCnt % 256) + ", 50%, 50%)";
		ctx.fill();
		
		// tail
		var left = this.left + this.headRadius;
		var top = this.top + this.headRadius;
		var right = this.left + this.boardWidth - this.thickness;
		var bottom = top + this.thickness;
		ctx.beginPath();
		ctx.arc(right, top + this.thickness / 2, this.thickness / 2,
			0, 2 * Math.PI, false);
		ctx.fill();
		ctx.fillRect(left, top, right - left, this.thickness);
		
		// face
		ctx.drawImage(this.image, this.left, this.top,
			this.image.width, this.image.height);
	};
}
BoardManager.prototype.image = new Image();
BoardManager.prototype.image.onload = function() {
	BoardManager.prototype.marginBottom = 20;
	BoardManager.prototype.top = fcGlobal.windowHeight - 
		BoardManager.prototype.image.height - BoardManager.prototype.marginBottom;
	BoardManager.prototype.headRadius = BoardManager.prototype.image.width / 2;
}
BoardManager.prototype.image.src = "images/face.png";



function AcceleratorManager() {
	this.watchId = null;
	
	this.startWatch = function() {
		alert("startWatch");
		var options = {
			frequency: 40 // 40ms, same as frame rate
		};
		if (navigator.accelerometer == null) {
			alert("null nav");
		} else {
			navigator.accelerometer.watchAcceleration(this.onSuccess, this.onError, options);
		}
	}
	this.startWatch();
	
	this.stopWatch = function() {
		if (this.watchId) {
			navigator.accelerometer.clearWatch(watchID);
			watchID = null;
		}
	}
	
	this.onSuccess = function(acceleration) {
		board.vx -= acceleration.z;
		alert('Acceleration X: ' + acceleration.x + '\n' +
			'Acceleration Y: ' + acceleration.y + '\n' +
			'Acceleration Z: ' + acceleration.z);
	}
	
	this.onError = function() {
		alert('onError!');
	}
}



function ScoreManager() {
	this.score = 0;
	
	this.fishCreated = 0; 				// fish come into scene
	this.fishMissed = 0;				// fish come out of scene without bubbled
	this.fishBubbled = 0; 				// fish covered by bubble
	this.fishBubbleBroken = 0;			// fish covered by bubble, bubble then be broken
	this.fishFloated = 0;				// fish covered by bubble, bubble be broken before fish become all bone
	this.fishCollected = 0;				// fish covered by bubble, then collected by board
	
	this.multiKill = {};				// more than one fish covered by the same bubble
	
	this.createFish = function() { // call when create a fish
		this.fishCreated += 1;
	}
	this.missedFish = function() {
		this.fishMissed += 1;
	}
	this.bubbleFish = function(left, top) { // call when a fish covered by bubble
		this.fishBubbled += 1;
		this.score += 1;
		prompt.addScore(1, left, top);
	}
	this.breakFishBubble = function(fishCnt, left, top) { // call when bubble that contain fish is broken
		this.fishBubbleBroken += 1;
		var score = fishCnt * fishCnt * 2;
		this.score += score;
		prompt.addScore(score, left, top);
		if (fishCnt > 1) {
			// left and top are not used in multi kill
			prompt.addBonus(prompt.MULTI_KILL, fishCnt, 0, 0);
		}
		
		// multi kill
		if (this.multiKill[fishCnt]) {
			this.multiKill[fishCnt] += 1;
		} else {
			this.multiKill[fishCnt] = 1;
		}
		if (fishCnt > 1) {
			if (this.multiKill[fishCnt - 1]) {
				this.multiKill[fishCnt - 1] -= 1;
			}
		}
	}
	this.floatFish = function() { // call when bubble be broken before fish become all bone
		this.fishFloated += 1;
	}
	this.collectFish = function(fishSize, left, top) { // call when a fish touches board
		this.fishCollected += 1;
		this.score += fishSize;
		prompt.addScore(fishSize, left, top);
	}
	
	this.margin = 10;
	this.top = 25;
	this.left = 10;
	this.draw = function() {
		ctx.fillStyle = "#c60";
		ctx.strokeStyle = "#ff0";
		ctx.font = '25px Calibri';
		
		// fish with bubble
		var left = this.margin + this.left;
		var top = this.margin;
		var textTop = this.margin + this.top;
		ctx.drawImage(this.bubbleImg, left, top, this.bubbleImg.width, this.bubbleImg.height);
		left += this.bubbleImg.width + 5;
		ctx.fillText(this.fishBubbled, left, textTop);
		ctx.strokeText(this.fishBubbled, left, textTop);
		left += 50;
		
		// fish collected
		ctx.drawImage(this.boneImg, left, top, this.boneImg.width, this.boneImg.height);
		left += this.boneImg.width + 5;
		ctx.fillText(this.fishCollected, left, textTop);
		ctx.strokeText(this.fishCollected, left, textTop);
		left += 50;
		
		// score
		ctx.drawImage(this.starImg, left, top, this.starImg.width, this.starImg.height);
		left += this.starImg.width + 5;
		ctx.fillText(this.score, left, textTop);
		ctx.strokeText(this.score, left, textTop);
	}
}
ScoreManager.prototype.bubbleImg = new Image();
ScoreManager.prototype.bubbleImg.src = "images/fish_bubble.png";
ScoreManager.prototype.boneImg = new Image();
ScoreManager.prototype.boneImg.src = "images/fish_bone.png";
ScoreManager.prototype.starImg = new Image();
ScoreManager.prototype.starImg.src = "images/star.png";

// Prompt information displayed, like score and bonus
function PromptManager() {
	this.scoreArray = [];
	this.bonusArray = [];
	
	this.addScore = function(score, left, top) {
		var size = 0.2 + (score / 50.0);
		if (size > 1.0) {
			size = 1.0;
		}
		var s = {
			"score": score,
			"life": 50, // frames
			"age": 0,
			"left": left,
			"top": top,
			"size": size
		};
		this.scoreArray.push(s);
	}
	
	this.addBonus = function(bonusType, para, left, top) {
		var b = {
			"bonusId": this.getBonusId(bonusType, para),
			"life": 50,
			"age": 0,
			// left and top are not used in some bonus type
			"left": left,
			"top": top
		}
		this.bonusArray.push(b);
	}
	
	this.draw = function() {
		// draw score
		var sLen = this.scoreArray.length;
		for (var i = 0; i < sLen; ++i) {
			if (this.scoreArray[i]) {
				var str = this.scoreArray[i].score.toString();
				
				var width = this.plusImage.width * this.scoreArray[i].size;
				var height = this.plusImage.height * this.scoreArray[i].size;
				var left = this.scoreArray[i].left;
				var totalWidth = width * (str.length + 1);
				if (left + totalWidth > fcGlobal.windowWidth) {
					left = fcGlobal.windowWidth - totalWidth;
				}
				var top = this.scoreArray[i].top;
				// draw plus
				ctx.drawImage(this.plusImage, left, top, width, height);
				left += width;
				// draw number
				var len = str.length;
				for (var j = 0; j < len; ++j) {
					var id = parseInt(str[j]);
					ctx.drawImage(this.numImage[id], left, top, width, height);
					left += width;
				}
				
				// grow old
				this.scoreArray[i].age += 1;
				if (this.scoreArray[i].age >= this.scoreArray[i].life) {
					// die, delete it 
					delete this.scoreArray[i];
				}
			}
		}
		
		// draw bonus
		var bLen = this.bonusArray.length;
		for (var i = 0; i < bLen; ++i) {
			if (this.bonusArray[i]) {
				var rate = 1.0 - this.bonusArray[i].age * 2 / this.bonusArray[i].life;
				if (rate < 0.5) rate = 0.5;
				
				var img = this.bonusImg[this.bonusArray[i].bonusId];
				var width = img.width * rate;
				var height = img.height * rate;
				var left = (fcGlobal.windowWidth - width) / 2;
				var top = 10;
				ctx.drawImage(img, left, top, width, height);
				
				// grow old
				this.bonusArray[i].age += 1;
				if (this.bonusArray[i].age >= this.bonusArray[i].life) {
					// die, delete it
					delete this.bonusArray[i];
				}
			}
		}
	}
}
PromptManager.prototype.numImage = [];
for (var i = 0; i < 10; ++i) {
	var numImg = new Image();
	numImg.src = "images/prompt/" + i.toString() + ".png";
	PromptManager.prototype.numImage.push(numImg);
}
PromptManager.prototype.plusImage = new Image();
PromptManager.prototype.plusImage.src = "images/prompt/+.png";

PromptManager.prototype.MULTI_KILL = 0;
// return index of bonusImg
PromptManager.prototype.getBonusId = function(bonusType, para) {
	if (bonusType == PromptManager.prototype.MULTI_KILL) {
		// para is the count of fish killed in a bubble
		if (para > 1) {
			if (para < 6) {
				return para - 2;
			} else {
				return 4;
			}
		} else {
			console.log("Error in multiKillId!");
			return -1;
		}
	}
}
PromptManager.prototype.bonusImg = [];
for (var i = 2; i <= 6; ++i) {
	var img = new Image();
	img.src = "images/prompt/kill" + i + ".png";
	PromptManager.prototype.bonusImg.push(img);
}
