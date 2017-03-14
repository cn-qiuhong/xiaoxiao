/*

 */

import {Sprite,spritE,newMyButton,calcPx} from "./max/display.js";
import {assets} from "./max/utilities.js";
import {gameSetup,gotoIndex} from "./t0.js";
import {record_g} from "./index.js";

export class Gameclear extends Sprite {
	constructor(board) {
		super(assets["images/gameclear.png"], calcPx(270), calcPx(480, 1));
		this.width = calcPx(223);
		this.height = calcPx(187, 1);
		this.layer = 15;
		let star = board.star;
		let lv = board.level;
		if (!record_g.levels[lv] || record_g.levels[lv] < star)record_g.levels[lv] = star;
		localStorage.setItem("sanxiao_huoxuan", JSON.stringify(record_g));
		spritE(assets["images/star1.png"], 240, 485, 28, 28, 16);
		if (star > 1) {
			let s3 = spritE(assets["images/star1.png"], 310, 485, 28, 28, 16);
			s3.scaleX = -1;
			if (star > 2) {
				spritE(assets["images/star2.png"], 275, 475, 36, 34, 16);
			}
		}
		let fanhui = newMyButton(assets["images/gameover_fanhui.png"], 190, 570, 100, 50, 16);
		fanhui.release = ()=> {
			gotoIndex();
		};
		let xiaguan = newMyButton(assets["images/gameclear_xiaguan.png"], 350, 570, 100, 50, 16);
		xiaguan.release = ()=> {
			gameSetup(lv + 1, board.hero);
		};
	}
}