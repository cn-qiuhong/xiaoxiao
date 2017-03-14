import {stage,text,newMyButton} from './max/display.js';
import {assets} from  './max/utilities.js';
import {gotoIndex} from './t0.js';

export class ReadyView {
	constructor() {
		let bg = newMyButton(assets['images/background.png'], 270, 480, 540, 960);
		bg.release = ()=> {
			gotoIndex();
		};

		let t1 = text("开始游戏", '50px 微软雅黑', 'black', 270, 500, 2);
		t1.alphachange = 0;
		t1.myAction = function () {
			if (this.alphachange) {
				this.alpha += .03;
				if (this.alpha > .9)this.alphachange = 0;
			}
			else {
				this.alpha -= .03;
				if (this.alpha < .1)this.alphachange = 1;
			}
		};
	}
}