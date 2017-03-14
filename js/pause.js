import { stage,DisplayObject,newMyButton } from './max/display.js';
import { gamePause,gotoIndex } from './t0.js';
import { assets } from './max/utilities.js';

class Pause extends DisplayObject {
	constructor() {
		super();
		this.jixu = newMyButton(assets['images/jixuyouxi.png'], 270, 300, 100, 50, 20);
		this.jixu.release = ()=> {
			gamePause();
		};
		this.jieshu = newMyButton(assets['images/jieshuchuangguan.png'], 270, 400, 100, 50, 20);
		this.jieshu.release = ()=> {
			gotoIndex();
		};
		this.hidE();
	}

	hidE() {
		this.show = false;
		this.jixu.alpha = 0;
		this.jixu.interactive = false;
		this.jieshu.alpha = 0;
		this.jieshu.interactive = false;
	}

	showOrHide() {
		if (this.show)this.hidE();
		else this.shoW();
	}

	shoW() {
		this.show = true;
		this.jixu.alpha = 1;
		this.jixu.interactive = true;
		this.jieshu.alpha = 1;
		this.jieshu.interactive = true;
	}

	update(p, cvs) {
		this.jixu.update(p, cvs);
		this.jieshu.update(p, cvs);
	}
}

export function newPause() {
	let p = new Pause();
	stage.add(p);
	return p;
}