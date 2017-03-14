import {Commodity} from './commodity.js';
import {stage,newMyButton,calcPx} from './max/display.js';
import {assets} from './max/utilities.js';

//商品id,price,name
export let commodityid = [0, 1, 2, 3, 4, 5, 6, 7];
export let commodityprice = [10, 100, 1000, 10000, 9999, 1, 0, 9];
export let commodityname = ['dj1', 'dj2', 'dj3', 'dj4', 'dj5', 'dj6', 'dj7', 'dj8'];
export let commodityicon = ['images/fk0.png', 'images/fk1.png', 'images/fk2.png', 'images/fk3.png', 'images/fk4.png', 'images/fk5.png', 'images/fk6.png', 'images/fk11.png'];
export let propintroduce = ['dj1', 'dj2', 'dj3', 'dj4', 'dj5', 'dj6', 'dj7', 'dj8'];

export class Sell {
	constructor() {
		let that = this;
		let bg = newMyButton(assets['images/herotujian_di.png'], 270, 480, 520, 710, 10);
		bg.press = function () {
			this.pressox = this.pointx;
			this.moved = false;
		};
		bg.moveIn = function () {
			this.pressox = this.pointx;
			this.moved = false;
		};
		bg.moveOut = function () {
			this.moved = false;
		};
		bg.move = function () {
			allMove(this.pointx - this.pressox);
			this.pressox = this.pointx;
		};
		bg.release = function () {
			if (this.moved)this.movetime = 10;
			this.moved = false;
		};
		bg.myAction = function () {
			if (this.movetime)this.movetime--;
		};
		this.bg = bg;

		//商品数组
		let commodity = [];
		let cpage = 1, maxpage = Math.ceil(commodityid.length / 12);
		let shownum = maxpage > 1 ? 12 : commodityid.length;
		for (let i = 0; i < shownum; i++) {
			commodity[i] = new Commodity(commodityid[i], 90 + i % 3 * 180, 250 + 180 * parseInt(i / 3), this);
			stage.add(commodity[i]);
		}
		this.commodity = commodity;

		//滑动
		function allMove(x) {
			if (Math.abs(x) < 25)return;
			bg.moved = true;
			if (x > 0 && cpage > 1) {
				showNewPage(--cpage);
			} else if (x < 0 && cpage < maxpage) {
				showNewPage(++cpage);
			}
		}

		//显示某页
		function showNewPage(page) {
			that.removeCommodityContent();
			let qfgs = (page - 1) * 12;
			let length = commodityid.length - qfgs;
			if (length > 12)length = 12;
			for (let i = 0; i < length; i++) {
				let site = qfgs + i;
				commodity[i].site = site;
				let id = commodityid[site];
				commodity[i].id = id;
				let price = commodityprice[id];
				commodity[i].price = price;
				commodity[i].pricetx.content = price;
				commodity[i].name.content = commodityname[id];
				commodity[i].createFromImage(assets[commodityicon[id]]);
				//commodity[i].width = calcPx(160);
				//commodity[i].height = calcPx(160, 1);
				commodity[i].interactive = true;
			}
			if (length < 16) {
				for (let i = length; i < 16; i++) {
					commodity[i].source = assets['images/trans.png'];
					commodity[i].interactive = false;
				}
			}
		}
	}

	removeCommodityContent() {
		this.commodity.forEach(commodity=> {
			if (commodity.content && commodity.content.show)commodity.content.removeAll();
		});
	}

	removeCommodity() {
		this.commodity.forEach(commodity=> {
			commodity.removeAll();
		});
	}

	removeAll() {
		this.removeCommodity();
		stage.removeTrue(this.bg);
	}
}
