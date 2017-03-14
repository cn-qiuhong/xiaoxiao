import {stage,text,newMyButton,spritE} from './max/display.js';
import {assets} from  './max/utilities.js';
import {ChooseHero} from  './choosehero.js';
import {index_g,record_g} from  './index.js';
import {BOARDDATA} from './information.js';

export class ChooseLevel {
	constructor() {
		this.ts = [];
		this.bt = [];
		let lvs = record_g.levels, x, y;
		let bgsy = index_g.bg.sourceY;
		for (let i = 0; i < BOARDDATA.length; i++) {
			x = BOARDDATA[i].x;
			y = BOARDDATA[i].y;
			this.ts.push(text("第" + (i + 1) + "关", '20px 微软雅黑', 'black', x, y + 50 + bgsy, 7));
			let img;
			let star = lvs[i + 1];
			if (BOARDDATA[i].mission.type == 'boss') {
				if (star > 0)img = assets["images/boss_tongguan.png"];
				else img = assets['images/boss_live.png'];
			} else {
				if (star > 0) {
					img = assets["images/guoguan1x.png"];
					if (star > 1) {
						stage.add(spritE(assets["images/guoguan2x.png"], x + 5, y + bgsy, 15, 35, 6));
						if (star > 2) {
							stage.add(spritE(assets["images/guoguan3x.png"], x + 12, y + bgsy+2, 20, 28, 6));
						}
					}
				} else img = assets['images/guanqia.png'];
			}
			let bt = newMyButton(img, x, y + bgsy, 60, 90, 5);
			bt.id = BOARDDATA[i].level;
			bt.release = function () {
				if (index_g.bg.moved || index_g.bg.movetime || !index_g.bgmoveable)return;
				index_g.content = new ChooseHero(this.id);
			};
			this.bt.push(bt);
		}
	}
}
