import { assets } from './max/utilities';
import { Sprite,text } from './max/display.js';

export default class Time extends Sprite {
	constructor(board) {
		super(assets['images/trans.png'], 620, 35);
		this.board = board;
		text("TIME", '30px 微软雅黑', 'white', 350, 90, 10);
		this.time = text(board.remainingtime, '30px 微软雅黑', 'white', 440, 90, 10);
		this.time.align = 'center';
	}

	myAction() {
		if (this.board.remainingtime >= 0) {
			this.time.content = parseInt(this.board.remainingtime / 1000);
		}
	}
}