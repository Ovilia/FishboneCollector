// check if to add or delete fish
function fishManager() {
	if (fcGlobal.frameCnt % (1 * fcGlobal.frameRate) == 0) { // add fish each sec
		var id = Math.floor(Math.random() * 7) + 1;
		var fish = new SmallFish(id);

		game.fishArray.push(fish);
		score.createFish();
	}
	game.shallowHeight = 10 * Math.sin(fcGlobal.frameCnt * 0.04) + 40;
}