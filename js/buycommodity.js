import {commodityname,commodityicon,commodityprice,propintroduce} from './sell.js';
import {newParagraph} from './paragraph.js';
import {text,spritE,Sprite,stage,newMyButton,calcPx} from './max/display.js';
import {assets} from './max/utilities.js';

export class BuyCommodity extends Sprite {
	constructor(id, father) {
		let price = commodityprice[id];
		let y = 400;
		super(assets['images/grid.png'], calcPx(270), calcPx(y, 1));
		let that = this;
		this.father = father;
		this.show = true;
		father.buycommodityshow = true;
		this.width = 400;
		this.height = 300;
		this.layer = 18;

		this.num = 1;

		this.fanhui = newMyButton(assets['images/main_return.png'], 420, y - 110, 50, 50, 20);
		this.fanhui.release = ()=> {
			this.removeAll();
		};

		this.icon = spritE(assets[commodityicon[id]], 150, y - 90, 80, 80, 20);

		this.tishi = text(commodityname[id], "35px 微软雅黑", "black", 270, y - 100, 20);

		this.minus = newMyButton(assets['images/shop_minus.png'], 170, y, 50, 50, 20);
		this.minus.release = ()=> {
			if (this.num == 1)return;
			this.num--;
			updateNumAndPrice();
		};
		this.minus.pressinG = ()=> {
			if (this.num == 1)return;
			this.num--;
			updateNumAndPrice();
		};

		this.add = newMyButton(assets['images/shop_add.png'], 370, y, 50, 50, 20);
		this.add.release = ()=> {
			if (this.num == 99)return;
			this.num++;
			updateNumAndPrice();
		};
		this.add.pressinG = ()=> {
			if (this.num == 99)return;
			this.num++;
			updateNumAndPrice();
		};

		this.numframe = spritE(assets['images/shop_numframe.png'], 270, y, 100, 60, 20);

		this.cnum = text(1, '40px 微软雅黑', 'white', 280, y - 7, 25);
		this.cnum.align = 'center';

		this.cost = text("总价:" + price, '30px 微软雅黑', 'black', 280, y - 60, 20);
		//this.cost.align='center';

		this.goumai = newMyButton(assets['images/shop_goumai.png'], 270, y + 80, 100, 50, 20);
		this.goumai.release = ()=> {

		};

		this.wenhao = newMyButton(assets['images/wenhao.png'], 400, y + 100, 60, 60, 20);
		this.wenhao.release = ()=> {
			if (this.jieshaoshow) {
				this.removeJieshao();
			} else {
				this.jieshaobg = spritE(assets['images/fk_ice1.png'], 270, y + 250, 400, 200, 20);
				this.jieshaoshow = true;
				this.jieshaotext = newParagraph(propintroduce[id], {x: 310, y: y + 220, layer: 25, size: 30, width: 380});
			}
		};

		function updateNumAndPrice() {
			that.cnum.content = that.num;
			that.cost.content = "总价:" + price * that.num;
		}
	}

	removeJieshao() {
		stage.removeTrue(this.jieshaobg, this.jieshaotext);
		this.jieshaoshow = false;
	}

	removeAll() {
		if (this.jieshaoshow)this.removeJieshao();
		stage.removeTrue(this.icon, this.fanhui, this.tishi, this.minus, this.add, this.numframe, this.cnum, this.cost, this.goumai, this.wenhao, this);
		this.father.buycommodityshow = false;
	}
}
