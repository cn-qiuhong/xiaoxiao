import { assets } from './max/utilities';
import { stage,text,newMyButton,calcPx } from './max/display.js';
import {KnapsackProp} from './knapsack_prop.js';
import {index_g} from './index.js';
import {ChooseLevel} from './chooselevel.js';

export let showprops;
export let prop_g = {
	"1": {name: "魔爆法杖", icon: "images/fk0.png", introduce: "合成魔爆师的专属装备"},
	"2": {name: "百科全书", icon: "images/fk1.png", introduce: "合成贤者的专属装备"},
	"3": {name: "魔导师之仗", icon: "images/fk2.png", introduce: "合成魔导师的专属装备"},
	"4": {name: "神偷眼罩", icon: "images/fk3.png", introduce: "合成神偷的专属装备"},
	"5": {name: "弩炮", icon: "images/fk4.png", introduce: "合成弩炮手的专属装备"},
	"6": {name: "爱的音符", icon: "images/fk5.png", introduce: "合成符文音阶少女的专属装备"},
	"7": {name: "万能碎片", icon: "images/fk6.png", introduce: "合成英雄的碎片，当专属碎片不足时替代专属碎片"},
	"8": {name: "魔爆师碎片", icon: "images/fk11.png", introduce: "合成魔爆师的专属碎片"},
	"9": {name: "贤者碎片", icon: "images/fk11.png", introduce: "合成贤者的专属碎片"},
	"10": {name: "魔导师碎片", icon: "images/fk11.png", introduce: "合成魔导师的专属碎片"},
	"11": {name: "神偷碎片", icon: "images/fk11.png", introduce: "合成神偷的专属碎片"},
	"12": {name: "弩炮手碎片", icon: "images/fk11.png", introduce: "合成弩炮手的专属碎片"},
	"13": {name: "符文音阶少女碎片", icon: "images/fk11.png", introduce: "合成符文音阶少女的专属碎片"},
	"14": {name: "技能药水", icon: "images/fk11.png", introduce: "使用后增加一点职业技能点"},
	"15": {name: "能量药水", icon: "images/fk11.png", introduce: "增加冒险家50%的能量"}
};

export class Knapsack {
	constructor() {
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

		index_g.back.alpha = 0;
		//index_g.back.release = ()=> {
		//	if (index_g.back.alpha != 1)return;
		//	this.removeAll();
		//	index_g.hideBackAndIndex();
		//};
		index_g.index.alpha = 1;
		index_g.bgmoveable = false;
		index_g.title = "knapsack";

		this.title = text("背包", '50px 微软雅黑', 'black', 270, 80, 12);

		//道具详情
		let propshowframe = new KnapsackProp(this);
		this.propf = propshowframe;

		let daoju = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 15];
		showprops = daoju.concat();
		let length = showprops.length;
		let maxpage = Math.ceil(length / 16) || 1;
		let cpage = 1;
		length = length > 16 ? 16 : length;
		let djarray = [];
		this.dj = djarray;
		for (let i = 0; i < length; i++) {
			let dj = newMyButton(assets['images/trans.png'], i % 4 * 130 + 75, parseInt(i / 4) * 150 + 250, 100, 100, 15);
			dj.site = i;
			dj.release = function () {
				if (bg.moved || bg.movetime > 0 || propshowframe.showing)return;
				propshowframe.show('knapsack', this.site);
			};
			djarray.push(dj);
		}

		//翻页
		let pageleft = newMyButton(assets['images/fanye_prev.png'], 205, 820, 70, 70, 15);
		pageleft.alpha = 0;
		pageleft.release = ()=> {
			if (cpage == 1 || bg.movetime || propshowframe.showing)return;
			showNewPage(--cpage);
		};
		this.pl = pageleft;
		let pageright = newMyButton(assets['images/fanye_next.png'], 335, 820, 70, 70, 15);
		pageright.alpha = 0;
		pageright.release = ()=> {
			if (cpage == maxpage || bg.movetime || propshowframe.showing)return;
			showNewPage(++cpage);
		};
		this.pr = pageright;
		showNewPage(1);

		//全部
		let filcondition = 'all';
		let all = newMyButton(assets['images/beibao_all.png'], 100, 150, 100, 50, 15);
		all.release = ()=> {
			if (filcondition == 'all')return;
			filcondition = 'all';
			showprops = daoju.concat();
			cpage = 1;
			maxpage = Math.ceil(showprops.length / 16) || 1;
			showNewPage(1);
		};
		this.all = all;
		//道具
		let prop = newMyButton(assets['images/beibao_prop.png'], 220, 150, 100, 50, 15);
		prop.release = ()=> {
			filtrate(isProp);
		};
		this.prop = prop;
		//碎片
		let debris = newMyButton(assets['images/beibao_debris.png'], 340, 150, 100, 50, 15);
		debris.release = ()=> {
			filtrate(isDebris);
		};
		this.debris = debris;
		//装备
		let equip = newMyButton(assets['images/beibao_equip.png'], 460, 150, 100, 50, 15);
		equip.release = ()=> {
			filtrate(isEquip);
		};
		this.equip = equip;

		//筛选
		function filtrate(fun) {
			if (!fun || filcondition == fun)return;
			filcondition = fun;
			showprops = [];
			daoju.forEach(id=> {
				if (fun(id))showprops.push(id);
			});
			cpage = 1;
			maxpage = Math.ceil(showprops.length / 16) || 1;
			showNewPage(1);
		}

		//显示某页
		function showNewPage(page) {
			let qfgs = (page - 1) * 16, daoj;
			length = showprops.length - qfgs;
			if (length > 16)length = 16;
			for (let i = 0; i < length; i++) {
				daoj = djarray[i];
				daoj.createFromImage(assets[prop_g[showprops[i + qfgs]].icon]);
				daoj.width = calcPx(100);
				daoj.height = calcPx(100, 1);
				daoj.site = qfgs + i;
				daoj.interactive = true;
			}
			if (length < 16 && djarray.length > length) {
				for (let i = length; i < 16; i++) {
					daoj = djarray[i];
					daoj.createFromImage(assets['images/trans.png']);
					daoj.interactive = false;
				}
			}
			if (page == maxpage)  showButton(pageright, 1);
			else if (page == maxpage - 1)   showButton(pageright);
			if (page == 1)  showButton(pageleft, 1);
			else if (page == 2)  showButton(pageleft);
		}

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
	}

	removeAll() {
		if (this.propf.showing)this.propf.hide();
		stage.removeTrue(this.bg, this.title, this.pl, this.pr, this.dj, this.all, this.prop, this.debris, this.equip);
	}
}

//控制button显示,不传active为显示，active真时隐藏
export function showButton(button, active) {
	if (active) {
		button.alpha = 0;
		button.interactive = false;
	} else {
		button.alpha = 1;
		button.interactive = true;
	}
}

//碎片
export function isDebris(id) {
	if (id >= 7 && id <= 13)return true;
}

//装备
export function isEquip(id) {
	if (id >= 1 && id <= 6)return true;
}

//道具
export function isProp(id) {
	if (id >= 14 && id <= 15)return true;
}
