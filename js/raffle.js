import { assets } from './max/utilities';
import { stage,spritE,newMyButton } from './max/display.js';
import {newFloatText} from './floattext.js';
import {index_g} from './index.js';
import {ChooseLevel} from './chooselevel.js';
import {HeroCard} from './herocard.js';
import {Knapsack} from './knapsack.js';
import {boardAssets} from './t0.js';

export class Raffle {
	constructor() {
		this.bg = spritE(assets['images/herotujian_di.png'],  270, 480, 520, 710, 10);
		let price = 10;//每次抽取花费
		this.bt1 = newMyButton(assets['images/shop_chouqu1.png'], 150, 710, 150, 100, 15);
		this.bt1.release = ()=> {
			raffle(1);
		};

		this.bt2 = newMyButton(assets['images/shop_chouqu10.png'], 400, 710, 150, 100, 15);
		this.bt2.release = ()=> {
			raffle(10);
		};

		this.dj = [];
		for (let i = 0; i < boardAssets.length; i++) {
			let sp = spritE(assets[boardAssets[i]], 100 + ranDom(400), 700 + i * 50, 80, 80, 12, {father: this.bg});
			sp.speed = 2 + ranDom(3);
			sp.myAction = function () {
				this.y -= this.speed;
				if (this.y < -100) {
					this.y = 800;
					this.x = 100 + ranDom(400);
					this.speed = 2 + ranDom(3);
				}
			};
			this.dj.push(sp);
		}

		function raffle(num) {
			let cost = num * price;//总花费
			let result = [];
			if (num > 9) {
				for (let i = 0; i < 9; i++)  result.push(raffleOneObject());
				result.push(raffleOneObject(1));
			} else {
				result.push(raffleOneObject());
			}
			for (let i = 0; i < result.length; i++) {
				newFloatText("获得了" + result[i] + "号道具", 270, 600, 'white');
			}
		}

		//抽取一次,high真时代表抽到好东西的概率大
		function raffleOneObject(high) {
			let sj = ranDom(5);
			return sj;
		}

		function ranDom(num) {
			return parseInt(Math.random() * num);
		}
	}

	removeAll() {
		stage.removeTrue(this.bg, this.bt1, this.bt2, this.dj);
	}
}
