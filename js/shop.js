import { text,stage,newMyButton } from './max/display.js';
import { assets } from './max/utilities.js';
import {Commodity} from './commodity.js';
import {index_g} from './index.js';
import {ChooseLevel} from './chooselevel.js';
import {HeroCard} from './herocard.js';
import {Knapsack} from './knapsack.js';
import {Sell} from './sell.js';
import {Raffle} from './raffle.js';

export class Shop {
	constructor(ui, id, target) {
		if (ui) {
			index_g.back.alpha = 1;
			index_g.back.release = ()=> {
				if (index_g.back.alpha != 1)return;
				if (ui == 'herocard') {
					index_g.content = new HeroCard(id);
				} else if (ui == 'knapsack') {
					index_g.content = new Knapsack();
				} else {
					index_g.hideBackAndIndex();
				}
				this.removeAll();
			};
		}
		index_g.index.alpha = 1;
		index_g.index.interactive = true;
		index_g.bgmoveable = false;
		index_g.title = "shop";

		this.title = text("商店", '50px 微软雅黑', 'black', 300, 70, 15);

		if (target == 'raffle')this.content = new Raffle();
		else this.content = new Sell();

		this.sellbt = newMyButton(assets['images/shop_sell.png'], 150, 120, 80, 30, 15);
		this.sellbt.release = ()=> {
			this.content.removeAll();
			this.content = new Sell();
		};
		this.raffle = newMyButton(assets['images/shop_raffle.png'], 390, 120, 80, 30, 15);
		this.raffle.release = ()=> {
			this.content.removeAll();
			this.content = new Raffle();
		};
		this.money = text("金钱：xxxxxxx", "30px 微软雅黑", 'black', 270, 25, 15);
	}

	removeAll() {
		this.content.removeAll();
		stage.removeTrue(this.title, this.sellbt, this.raffle, this.money);
	}
}
