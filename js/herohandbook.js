import { assets } from './max/utilities';
import { text,stage,spritE,newMyButton,buttons } from './max/display.js';
import {boardAssets} from './t0.js';
import {index_g} from './index.js';
import {ChooseLevel} from './chooselevel.js';
import {Knapsack} from './knapsack.js';
import {HeroCard} from './herocard.js';

//hero information
export let heroif = {
	"length": 6,
	"7": {id: 7, name: "魔爆师", star: 3, icon: 'images/fk7.png', skillicon: "images/skill.png"},
	"8": {id: 8, name: "贤者", star: 2, icon: 'images/fk8.png', skillicon: "images/skill.png"},
	"9": {id: 9, name: "魔导师", star: 3, icon: 'images/fk9.png', skillicon: "images/skill.png"},
	"10": {id: 10, name: "神偷", star: 3, icon: 'images/fk10.png', skillicon: "images/skill.png"},
	"11": {id: 11, name: "弩炮手", star: 1, icon: 'images/fk11.png', skillicon: "images/skill.png"},
	"12": {id: 12, name: "符文音阶少女", star: 4, icon: 'images/fk12.png', skillicon: "images/skill.png"}
};

export let herohandbook_g;

export class HeroHandBook {
	constructor(ui) {
		let that = this;
		let bg = newMyButton(assets['images/herotujian_di.png'], 270, 480, 520, 710, 10);
		bg.press = function () {
			//console.log("bg down");
			this.pressoy = this.pointy;
			this.moved = false;
		};
		bg.moveIn = function () {
			this.pressoy = this.pointy;
			this.moved = false;
		};
		bg.moveOut = function () {
			this.moved = false;
		};
		bg.move = function () {
			allMove(this.pointy - this.pressoy);
			this.pressoy = this.pointy;
		};
		bg.release = function () {
			//console.log("bg down");
			if (this.moved) {
				this.movetime = 10;
			}
			this.moved = false;
		};
		bg.myAction = function () {
			if (this.movetime > 0) {
				this.movetime--;
			}
		};
		this.bg = bg;

		if (ui) {
			index_g.back.alpha = 1;
			index_g.back.release = ()=> {
				if (index_g.back.alpha != 1)return;
				this.removeAll();
				if (ui == 'knapsack') index_g.content = new Knapsack();
				else index_g.hideBackAndIndex();
			};
		} else {
			index_g.back.alpha = 0;
		}
		index_g.index.alpha = 1;
		index_g.bgmoveable = false;
		index_g.title = "herohandbook";

		//英雄
		let bts = [], ts = [], y = 0, oy = 130, heroid = [];
		addToHeroid();
		for (let i = 0; i < heroid.length; i++) {
			let rownum = Math.ceil(y / 3);
			oy -= 40;
			//不能用text，换成sprite，文本无法做到超出包容部分不显示
			ts[i] = spritE(assets["images/fk_ice3.png"], 270, oy + rownum * 180, 50, 30, 15, {father: bg});
			ts[i].myAction = function () {
				if (this.movepy) {
					//console.log("move");
					this.y += this.movepy;
					this.movepy = 0;
				}
			};
			y += 3;
			while (y % 3)y++;
			rownum++;
			oy -= 40;
			for (let j = 0; j < heroid[i].length; j++) {
				let id = heroid[i][j].id;
				let bt = newMyButton(assets[heroif[id].icon], 175 * (j % 3) + 85, oy + (parseInt(j / 3) + rownum) * 180, 150, 150, 15, {father: bg});
				bt.id = id;
				bt.myAction = function () {
					//console.log(this._interactive + "," );
					if (this.movepy) {
						this.y += this.movepy;
						this.movepy = 0;
					}
				};
				bt.release = function () {
					//console.log("yxbt down:" + this.id);
					if (bg.moved || bg.movetime) {
						//console.log(bg.moved + "," + bg.movetime);
						return;
					}
					//零时应对切到其他页仍能点击的怪状
					if (index_g.title != "herohandbook") {
						var index = buttons.indexOf(this);
						if (index >= 0)buttons.splice(index, 1);
						return;
					}
					that.removeAll();
					index_g.content = new HeroCard(this.id, "herohandbook");
				};
				bts.push(bt);
				y++;
			}
		}

		function allMove(py) {
			//console.log(py);
			if (ts[0].y > 100 && py > 0)return;
			if (bts[bts.length - 1].y < 600 && py < 0)return;
			if (Math.abs(py) > 5)bg.moved = true;
			for (let i = 0; i < bts.length; i++)bts[i].movepy = py;
			for (let i = 0; i < ts.length; i++)ts[i].movepy = py;
		}

		function addToHeroid() {
			let h1 = [], h2 = [], h3 = [], h4 = [];//分别对应星级及英雄
			for (let i = 0; i < heroif.length; i++) {
				switch (heroif[i + 7].star) {
					case 1:
						h1.push(heroif[i + 7]);
						break;
					case 2:
						h2.push(heroif[i + 7]);
						break;
					case 3:
						h3.push(heroif[i + 7]);
						break;
					case 4:
						h4.push(heroif[i + 7]);
						break;
				}
			}
			heroid.push(h1, h2, h3, h4);
		}
	}

	removeAll() {
		//console.log("bts:" + buttons.length);
		stage.removeTrue(this.bg);
		//console.log("bgc:" + this.bg.children);
		//console.log(buttons);
	}
}
