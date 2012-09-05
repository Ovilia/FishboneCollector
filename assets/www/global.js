$(document).ready(function() {
	fcGlobal = new FcGlobal();
	
	document.addEventListener('deviceready', onDeviceReady, false);

	fcGlobal.windowWidth = $(window).width();
	fcGlobal.windowHeight = $(window).height();
	$("#homeCanvas").attr("width", fcGlobal.windowWidth).attr("height", fcGlobal.windowHeight);
	$("#levelCanvas").attr("width", fcGlobal.windowWidth).attr("height", fcGlobal.windowHeight);
	$("#gameCanvas").attr("width", fcGlobal.windowWidth).attr("height", fcGlobal.windowHeight);

	// only for debug on web page
	var userAgent = navigator.userAgent.toLowerCase();
	if (!userAgent.match(/android/)) {
		debug();
	}
	
	initHome();
});

function FcGlobal() {
	this.windowWidth = 0;
	this.windowHeight = 0;
	
	this.status = this.HOME_STATUS;
	
	this.frameRate = 25; // 25 frames each second
	this.frameCnt = 0;
}
FcGlobal.prototype.HOME_STATUS = 0;
FcGlobal.prototype.LEVEL_STATUS = 1;
FcGlobal.prototype.GAME_STATUS = 2;



function onDeviceReady() {
	document.body.addEventListener("touchstart", onTouchStart, false);
    document.body.addEventListener('touchmove', onTouchMove, false);
    document.body.addEventListener('touchend', onTouchEnd, false);
}



function onTouchStart(e){
	e.preventDefault();
	if (fcGlobal.status == fcGlobal.HOME_STATUS) {
		homeTouchStart(e);
	} else if (fcGlobal.status == fcGlobal.GAME_STATUS) {
		gameTouchStart(e);
	}
}

function onTouchMove(e) {
	if (fcGlobal.status == fcGlobal.HOME_STATUS) {
		homeTouchMove(e);
	} else if (fcGlobal.status == fcGlobal.GAME_STATUS) {
		gameTouchMove(e);
	}
}

function onTouchEnd(e) {
	if (fcGlobal.status == fcGlobal.HOME_STATUS) {
		homeTouchEnd(e);
	} else if (fcGlobal.status == fcGlobal.GAME_STATUS) {
		gameTouchEnd(e);
	}
}


function debug() {
	$('canvas').mousedown(onTouchStart);
	$('canvas').mouseup(onTouchEnd);
	$('canvas').mousemove(onTouchMove);
	$(document).keypress(function(e) {
		if (e.which == 122) { // z to move left
			board.vx -= 10;
		} else if (e.which == 120) { // x to move right
			board.vx += 10;
		}
	});
}