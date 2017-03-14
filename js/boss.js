import { assets } from './max/utilities';
import { Sprite,rectangle,calcPx } from './max/display.js';
import { bossAssets } from './t0.js';

export default class Boss extends Sprite {
	constructor(view) {
		let boss = view.board.boss;
		let x = 35 + 67 * boss.x + 32 * boss.w;
		let y = 260 + 67 * boss.y + 32 * boss.h;
		super(assets[bossAssets[boss.type]], calcPx(x), calcPx(y, 1));
		this.layer = 5;
		this.width = 67 * (boss.w + 1) - 10;
		this.height = 67 * (boss.h + 1) - 6;
		this.ox = x - parseInt(this.width / 2) + 2;
		let oy = y - parseInt(this.height / 2);
		this.r1 = rectangle(this.width, 11, 'white', 'none', 0, x, oy + 10);
		this.r1.layer = 6;
		this.hpw = this.width - 4;
		this.r2 = rectangle(this.hpw, 8, 'red', 'none', 0, x, oy + 10);
		this.r2.layer = 7;
		this.hp = boss.hp;
		this.view = view;
	}

	myAction() {
		let w = parseInt(this.view.bosshp / this.hp * this.hpw);
		this.r2.width = calcPx(w);
		this.r2.x = calcPx(this.ox + parseInt(w / 2));
	}
}