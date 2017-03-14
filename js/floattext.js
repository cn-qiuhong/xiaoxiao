import { assets } from './max/utilities';
import { Text,text,stage,calcPx } from './max/display.js';

//渐隐上升文本
class FloatText extends Text {
	constructor(text, x, y, color, show) {
		x = calcPx(x);
		y = calcPx(y, 1);
		let size = calcPx(40);
		let font = size + 'px 微软雅黑';
		super(text, font, color || 'white', x, y);
		this.layer = 15;
		this.count = 30;
		this.show = show;
		stage.children.forEach(sprite=> {
			if (sprite instanceof FloatText)sprite.y -= calcPx(35,1);
		});
	}

	myAction() {
		if (this.parent && !this.show) {
			this.count--;
			if (!this.count)this.parent.remove(this);
			this.alpha = 1 - 1 / this.count;
		}
		this.y -= 2;
	}
}

export function newFloatText(text, x, y, color, show) {
	let ft = new FloatText(text, x, y, color, show);
	stage.add(ft);
	return ft;
}

export function forNewFloatText(textarr) {
	let ts = [];
	for (let i = 0; i < textarr.length; i++) {
		let tx = text(textarr[i], '40px 微软雅黑', 'black', Math.random() * 400 + 100, 700 + i * 50, 15);
		tx.myAction = function () {
			this.y -= 2;
			if (this.y < 100) {
				this.y = 800;
				this.x = Math.random() * 400 + 100;
			}
		};
		ts.push(tx);
	}
	return ts;
}
