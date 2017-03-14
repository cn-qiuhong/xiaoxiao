import { assets } from './max/utilities';
import { Sprite,text } from './max/display.js';

export default class Step extends Sprite {
	constructor(board) {
		super(assets['images/trans.png']);
		this.board = board;
		this.stepslimit = board.stepslimit;
		text("STEP", '30px 微软雅黑', 'white', 360, 90, 10);
		this.step = text(this.stepslimit, '30px 微软雅黑', 'white', 450, 90, 10);
		this.step.align = 'center';
	}

	myAction() {
		if (this.board.stepslimit != this.stepslimit) {
			this.stepslimit = this.board.stepslimit;
			this.step.content = this.stepslimit;
		}
	}
}