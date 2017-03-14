import { assets } from './max/utilities';
import { Sprite,spritE,text,stage,calcPx } from './max/display.js';
import { boardAssets } from './t0.js';

export default class Mission extends Sprite {
	constructor(view) {
		super(assets['images/trans.png']);
		let board = view.board;
		let data = board.mission.data;
		switch (board.mission.type) {
			case "eliminate":
				this.sl = [];
				let ox = 50, ds, td;
				switch (data.length) {
					case 1:
						ox = 100;
						ds = 100;
						td = 80;
						break;
					case 2:
						ds = 60;
						td = 50;
						break;
				}
				for (let i = 0; i < data.length; i++) {
					let type = data[i].type;
					let num = data[i].data;
					let s = spritE(assets['images/trans.png'], ox + 2 * ds * i, 185, 50, 50, 6);
					switch (type) {
						case 0:
						case 1:
						case 2:
						case 3:
						case 4:
							s.createFromImage(assets[boardAssets[type]]);
							break;
						case 5:
							s.createFromImage(assets['images/fk_ice1.png']);
							break;
						case 6:
							s.createFromImage(assets['images/fk_nikuai.png']);
							break;
						case 7:
							s.createFromImage(assets["images/fk13.png"]);
							break;
					}
					s.width = calcPx(50);
					s.height = calcPx(50, 1);
					this.sl[i] = text(num, '40px 微软雅黑', 'white', ox + td + 2 * ds * i, 180, 6);
				}
				break;
			case "cellect":
				let s = spritE(assets[boardAssets[6]], 100, 180, 64, 64, 6);
				this.sl = text(data, '50px 微软雅黑', 'white', 180, 170, 6);
				break;
			case "score":
				let score = text('score', '30px 微软雅黑', 'white', 135, 150, 10);
				this.sl = text(data, '40px 微软雅黑', 'white', 190, 185, 10);
				this.sl.align = "center";
				break;
			case "boss":
				let hp = text('BOSS HP', '35px 微软雅黑', 'white', 105, 185, 6);
				this.sl = text(data.hp, '35px 微软雅黑', 'white', 220, 185, 6);
				break;
			case "escape":
				let tx = text("ESCAPE", '40px 微软雅黑', 'white', 136, 180, 6);
				let door = spritE(assets['images/fk_door.png'], 150, 185, 30, 40, 7);
				break;
			case "rescue":
				let cunmin = spritE(assets["images/fk_cunmin.png"], 100, 180, 64, 64, 6);
				this.sl = text(data.length, '50px 微软雅黑', 'white', 180, 170, 6);
				break;
		}
		this.board = board;
		this.view = view;
	}

	myAction() {
		let board = this.board;
		let view = this.view;
		let mission = board.mission;
		let data = mission.data;
		switch (mission.type) {
			case 'eliminate':
				for (let i = 0; i < this.sl.length; i++) {
					let type = data[i].type;
					let num = data[i].data - view.eliminate[type];
					this.sl[i].content = num < 0 ? 0 : num;
				}
				break;
			case "cellect":
				this.sl.content = data - board.goldbeans;
				break;
			case "score":
				let score = data - view.score;
				this.sl.content = score < 0 ? 0 : score;
				break;
			case "boss":
				this.sl.content = view.bosshp;
				break;
			case "rescue":
				this.sl.content = data.length - board.rescuecunminshu;
				break;
		}
	}
}