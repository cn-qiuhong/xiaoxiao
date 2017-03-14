import {spritE,Sprite,stage,text,newMyButton,calcPx} from './max/display.js';
import {assets} from  './max/utilities.js';
import {commodityicon,commodityname,commodityprice} from './sell.js';
import {BuyCommodity} from './buycommodity.js';

export class Commodity extends Sprite {
	constructor(id, x, y, father) {
		super(assets['images/fk_ice3.png'], calcPx(x), calcPx(y, 1));
		this.width = calcPx(150);
		this.height = calcPx(150, 1);
		this.layer = 12;
		this.interactive = true;
		this.release = function () {
			if (father.bg.moved || father.bg.movetime)return;
			if (!father.buycommodityshow) {
				this.content = new BuyCommodity(this.id, father);
				stage.add(this.content);
			}
		};

		this.id = id;
		this.price = commodityprice[id];

		this.icon = spritE(assets[commodityicon[id]], x, y - 30, 70, 70, 15);

		this.name = text(commodityname[id], '25px 微软雅黑', 'black', x, y + 25, 15);

		this.pricetx = text(this.price, '25px 微软雅黑', 'black', x, y + 50, 15);
	}

	removeAll() {
		if (this.content && this.content.show)this.content.removeAll();
		stage.removeTrue(this.bg, this.icon, this.name, this.pricetx, this);
	}
}
