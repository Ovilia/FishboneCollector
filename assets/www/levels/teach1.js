// check if to add or delete fish
function fishManager() {
	if (game.frameCnt % (2 * game.frameRate) == 0) { // add fish each 2 sec
		var id = Math.floor(Math.random() * 7) + 1;
		var fish = new SmallFish(id);

		game.fishArray.push(fish);
		score.createFish();
	}
	game.shallowHeight = 10 * Math.sin(game.frameCnt * 0.04) + 40;
}