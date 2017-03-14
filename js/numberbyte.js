import { assets } from './max/utilities';
import { Sprite,stage,calcPx } from './max/display.js';

class NumberByte extends Sprite {
	constructor(x, y, w = 36, h = 44, value = 0) {
		x = calcPx(x);
		y = calcPx(y, 1);
		super(assets['images/0.png'], x, y);
		this.layer = 20;
		this.width = calcPx(w);
		this.height = calcPx(h, 1);
		this.value = parseInt(value);
		this.source = assets["images/" + this.value + ".png"];
	}

	get num() {
		return this.value;
	}

	set num(value) {
		this.value = parseInt(value);
		this.source = assets["images/" + this.value + ".png"];
	}
}

export function newNumber(x, y, w, h, value) {
	let scorebyte = new NumberByte(x, y, w, h, value);
	stage.add(scorebyte);
	return scorebyte;
}