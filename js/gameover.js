/*

 */

import {Sprite,newMyButton,calcPx} from "./max/display.js";
import {assets} from "./max/utilities.js";
import {gameSetup,gotoIndex} from "./t0.js";

export class Gameover extends Sprite {
	constructor(board) {
		super(assets["images/gameover.png"], calcPx(270), calcPx(480, 1));
		this.width = calcPx(500);
		this.height = calcPx(350, 1);
		this.layer = 15;
		let fanhui = newMyButton(assets["images/gameover_fanhui.png"], 150, 600, 100, 50, 16);
		fanhui.release = ()=> {
			gotoIndex();
		};
		let zaici = newMyButton(assets["images/gameover_zaici.png"], 390, 600, 100, 50, 16);
		zaici.release = ()=> {
			gameSetup(board.level, board.hero);
		};
	}
}