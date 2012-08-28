// check if to add or delete fish
function fishManager() {
	if (frameCnt % (4 * frameRate) == 0) { // add fish each 4 sec
		var id = Math.floor(Math.random() * 7) + 1;
		var fish = new SmallFish(id);

		fishArray.push(fish);
	}
	shallowHeight = 10 * Math.sin(frameCnt * 0.04) + 40;
}