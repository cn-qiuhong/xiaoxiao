import {assets} from './max/utilities.js';
import {stage,spritE,bigmap,text,newMyButton,calcPx} from './max/display.js';
import {ChooseLevel} from './chooselevel.js';
import {HeroHandBook,heroif} from './herohandbook.js';
import {HeroCard} from "./herocard.js";
import {Shop} from './shop.js';
import {OtherMenu} from './othermenu.js';
import {Knapsack} from './knapsack.js';
import {BOARDDATA} from './information.js';


export let index_g, record_g;

export class Index {
	constructor() {
		index_g = this;
		index_g.title = "index";
		record_g = JSON.parse(localStorage.getItem("sanxiao_huoxuan"));
		if (record_g == null)  record_g = {levels: [0]};
		//返回
		this.back = newMyButton(assets['images/main_return.png'], 50, 160, 60, 60, 16);
		this.back.alpha = 0;
		//到主页
		this.index = newMyButton(assets['images/main_index.png'], 490, 160, 60, 60, 16);
		this.index.alpha = 0;
		this.index.release = ()=> {
			if (index_g.index.alpha != 1)return;
			if (this.content)this.content.removeAll();
			this.hideBackAndIndex();
		};

		this.bgmoveable = true;
		//背景
		let bg = bigmap(assets['images/xuanguan_bg1.png'], 270, 480, 540, 960, 0, 0, 1280);
		bg.sourceY = 456;
		bg.interactive = true;
		bg.press = function () {
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
			if (!index_g.bgmoveable)return;
			allMove(this.pointy - this.pressoy);
			this.pressoy = this.pointy;
		};
		bg.release = function () {
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
		let bg1 = bigmap(assets['images/xuanguan_bg1bu.png'], 270, 480, 540, 960, 6, 0, 1280);
		bg1.sourceY = bg.sourceY;

		//头像
		let heroid = 11, skilllevel = 9;
		spritE(assets['images/main_touxiangdiban.png'], 50, 50, 100, 100, 2);
		let touxiang = newMyButton(assets[heroif[heroid].icon], 45, 50, 80, 80, 3);
		touxiang.release = ()=> {
			//console.log("tx up");
			if (bg.moved || bg.movetime || !this.bgmoveable)return;
			//this.removeMenu();
			if (this.content)this.content.removeAll();
			this.content = new HeroCard(heroid);
		};
		spritE(assets['images/main_touxiangframe.png'], 50, 50, 100, 100, 5);
		spritE(assets['images/main_baoshihuang.png'], 65, 10, 20, 20, 6);
		//技能
		spritE(assets['images/main_jinengdiban.png'], 120, 30, 60, 60, 2);
		spritE(assets[heroif[heroid].skillicon], 120, 30, 60, 60, 3);
		spritE(assets['images/main_jinengkuang.png'], 120, 30, 60, 60, 4);
		spritE(assets['images/main_dengji.png'], 97, 53, 20, 20, 6);
		text(skilllevel, '15px 微软雅黑', 'white', 97, 50, 7);

		//任务
		let mission = newMyButton(assets['images/main_renwu.png'], 55, 180, 105, 100, 5);
		mission.release = ()=> {
			if (!this.bgmoveable || bg.moved || bg.movetime)return;
			console.log("任务按钮被点击了");
		};

		//迷之问号
		let wenhao = newMyButton(assets['images/main_wenhao.png'], 55, 310, 105, 100, 5);
		wenhao.release = ()=> {
			if (!this.bgmoveable || bg.moved || bg.movetime)return;
			console.log("问号被点击了");
		};

		//英雄图鉴
		let hero = newMyButton(assets['images/main_tujian.png'], 100, 890, 190, 134, 50);
		hero.name = "hero";
		hero.release = ()=> {
			//console.log("hero r-i:" + bg.moved + "," + bg.movetime);
			if (bg.moved || bg.movetime)return;
			//this.removeMenu();
			if (this.content)this.content.removeAll();
			//console.log(buttons);
			this.content = new HeroHandBook();
		};

		//背包
		let knapsack = newMyButton(assets['images/main_beibao.png'], 270, 890, 116, 111, 50);
		knapsack.release = ()=> {
			if (bg.moved || bg.movetime)return;
			//this.removeMenu();
			if (this.content)this.content.removeAll();
			this.content = new Knapsack();
		};

		//商城
		let shop = newMyButton(assets['images/main_shangcheng.png'], 450, 890, 112, 106, 50);
		shop.release = ()=> {
			if (bg.moved || bg.movetime)return;
			//this.removeMenu();
			if (this.content)this.content.removeAll();
			this.content = new Shop();
		};

		// let other = newMyButton(assets['images/option.png'], 440, 900, 80, 80, 50);
		// other.release = ()=> {
		// 	if(!this.menu){
		//     this.menu=new OtherMenu(this);
		//   }else if(!this.menu.showing){
		//     this.menu.show();
		//     console.log("menu show");
		//   }else if(this.menu.showing){
		//     this.menu.hide();
		//     console.log("menu hide");
		//   }
		// };

		//选关界面
		this.chooselevel = new ChooseLevel();
		//new HeroHandBook();
		//new Raffle();
		//new Shop();

		function allMove(y) {
			if (bg.sourceY <= 3 && y > 0)return;
			if (bg.sourceY >= 454 && y < 0)return;
			if (Math.abs(y) > 5)  bg.moved = true;//手机上很难不移动，但是移动在5px以内时视为没移动
			bg.sourceY -= y;
			if (bg.sourceY < 0) {
				bg.sourceY = 0;
			} else if (bg.sourceY > 456) {
				bg.sourceY = 456;
			}
			bg1.sourceY = bg.sourceY;
			for (let i = 0; i < index_g.chooselevel.bt.length; i++) {
				let ty = 456 + BOARDDATA[i].y + (456 - bg.sourceY) / 1.33;//图的实际大小比上理想尺寸
				index_g.chooselevel.bt[i].y = calcPx(ty, 1);
				index_g.chooselevel.ts[i].y = calcPx(ty + 50, 1);
			}
		}
	}

	removeMenu() {
		if (this.menu && this.menu.showing)this.menu.hide();
	}

	hideBackAndIndex() {
		this.bgmoveable = true;
		this.back.alpha = 0;
		this.index.alpha = 0;
		index_g.title = "index";
	}
}
