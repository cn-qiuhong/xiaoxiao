import {stage,text,newMyButton,spritE} from './max/display.js';
import {assets} from  './max/utilities.js';
import {gameSetup,boardAssets} from './t0.js';
import {ChooseLevel} from './chooselevel.js';
import {HeroCard} from './herocard.js';
import {Knapsack} from './knapsack.js';
import {index_g} from './index.js';

export class ChooseHero {
	constructor(level, ui, heroid) {
		if (ui) {
			index_g.back.alpha = 1;
			index_g.back.release = ()=> {
				this.removeAll();
				if (ui == 'herocard') {
					index_g.content = new HeroCard(heroid);
				} else if (ui == 'knapsack') {
					index_g.content = new Knapsack();
				} else {
					index_g.hideBackAndIndex();
				}
			};
		}
		index_g.index.alpha = 1;
		index_g.bgmoveable = false;

		this.bg = spritE(assets['images/herotujian_di.png'], 270, 480, 520, 710, 10);

		text("关卡" + level + " 选择英雄", '40px 微软雅黑', 'white', 270, 40, 15, this.bg);

		let heros = [
			{id: 7, level: 3, energy: 10},
			{id: 8, level: 3, energy: 10},
			{id: 9, level: 3, energy: 10},
			{id: 10, level: 3, energy: 10},
			{id: 11, level: 3, energy: 10},
			{id: 12, level: 3, energy: 10}
		];

		let tname = ["魔爆师", "贤者", "魔导师", "神偷", "弩炮手", "符文音阶少女"];
		this.ts = [];
		this.bt = [];
		for (let i = 0; i < tname.length; i++) {
			this.ts.push(text(tname[i], '30px 微软雅黑', 'white', 350, 750 - 100 * i, 20));
			let bthr = newMyButton(assets[boardAssets[heros[i].id]], 200, 750 - 100 * i, 80, 80, 20);
			bthr.id = i;
			bthr.release = function () {
				gameSetup(level, heros[this.id]);
			};
			this.bt.push(bthr);
		}
	}

	removeAll() {
		stage.removeTrue(this.bg, this.ts, this.bt);
	}
}
