import { assets } from './max/utilities';
import { spritE,text,newMyButton,calcPx } from './max/display.js';
import {newParagraph} from './paragraph.js';
import {showprops,prop_g,isDebris,isEquip,isProp} from './knapsack.js';
import {index_g} from './index.js';
import {ChooseHero} from './choosehero.js';
import {Shop} from './shop.js';
import {HeroCard} from './herocard.js';
import {HeroHandBook} from './herohandbook.js';

export class KnapsackProp {
	constructor() {
		let that = this;
		this.bg = newMyButton(assets['images/fk_ice1.png'], 270, 450, 500, 600, 22);
		this.bg.release = ()=> {
			this.hide();
		};
		//透明
		this.bottombg = newMyButton(assets['images/trans.png'], 270, 480, 540, 960, 21);
		this.bottombg.release = ()=> {
			if (this.showing)this.hide();
		};
		this.propicon = spritE(assets['images/fk0.png'], 110, 280, 100, 100, 25);
		this.propname = text("1号道具", '50px 微软雅黑', 'black', 270, 280, 25);
		this.jieshao = newParagraph("道具简介", {size: 30, width: 400, x: 270, y: 370, layer: 25});
		this.chuchu = text("出处：", '30px 微软雅黑', 'black', 100, 510, 25);
		//this.back = newMyButton(assets['images/main_return.png'], 460, 210, 60, 60, 215);
		//this.back.release = ()=> {
		//	this.hide();
		//};
		this.use = newMyButton(assets['images/beibao_use.png'], 270, 650, 80, 50, 25);
		this.use.release = ()=> {
			this.usE();
		};
		this.compound = newMyButton(assets['images/beibao_compound.png'], 270, 650, 80, 50, 25);
		this.compound.release = ()=> {
			this.compounD();
		};
		this.produce = [];
		//具体关卡数
		for (let i = 0; i < 5; i++) {
			let tl = text("", '30px 微软雅黑', 'blue', 90 + i % 5 * 80, 550 + 50 * parseInt(i / 5), 25);
			tl.interactive = true;
			tl.release = function () {
				index_g.content.removeAll();
				index_g.content = new ChooseHero(this.level, that.ui, that.heroid);
			};
			this.produce.push(tl);
		}
		this.gk = text("关卡：", '30px 微软雅黑', 'black', 270, 510, 25);
		this.rf = text("抽取", '30px 微软雅黑', 'blue', 175, 510, 25);
		this.rf.release = ()=> {
			index_g.content.removeAll();
			index_g.content = new Shop(this.ui, this.heroid, 'raffle');
		};
		this.hide();
	}

	compounD() {
		let heroid;
		if (this.id == 7) {//通用碎片
			index_g.content.removeAll();
			index_g.content = new HeroHandBook("knapsack");
			return;
		} else {
			if (this.id < 7)heroid = this.id + 6;
			else if (this.id > 7)heroid = this.id - 1;
		}
		index_g.content.removeAll();
		index_g.content = new HeroCard(heroid, "knapsack");
	}

	hide() {
		this.bg.alpha = 0;
		this.propicon.source = assets['images/trans.png'];
		this.propname.content = "";
		this.chuchu.content = "";
		this.gk.content = "";
		this.rf.content = "";
		this.rf.interactive = false;
		this.jieshao.removeAll();
		//this.back.alpha = 0;
		//this.back.interactive = false;
		this.use.alpha = 0;
		this.use.interactive = false;
		this.compound.alpha = 0;
		this.compound.interactive = false;
		for (let i = 0; i < this.produce.length; i++) {
			this.produce[i].content = "";
			this.produce[i].interactive = false;
		}
		this.bottombg.interactive = false;
		this.bg.interactive = false;
		this.showing = false;
	}

	show(ui, id, heroid) {
		this.showing = true;
		if (ui == 'knapsack') {
			this.site = id;
			id = showprops[id];
		}
		this.ui = ui;
		this.heroid = heroid;
		this.id = id;
		this.bg.alpha = 1;
		this.propicon.createFromImage(assets[prop_g[id].icon]);
		this.propicon.width = calcPx(100);
		this.propicon.height = calcPx(100, 1);
		this.propname.content = prop_g[id].name;
		this.jieshao.setText(prop_g[id].introduce);
		//this.back.alpha = 1;
		//this.back.interactive = true;
		this.bottombg.interactive = true;
		this.bg.interactive = true;
		if (ui == 'knapsack') {
			if (isProp(id)) {
				this.use.alpha = 1;
				this.use.interactive = true;
			} else if (isDebris(id) || isEquip(id)) {
				this.compound.alpha = 1;
				this.compound.interactive = true;
			}
		}
		this.chuchu.content = "出处：";
		let produce = PRODUCTION_PLACE[id], raffle, i, lv;
		if (produce) {
			raffle = produce.raffle;
			//能获取到的关卡，先获取玩家记录，没玩到的关卡，不能点击，颜色也不同
			if (produce.level.length > this.produce.length) {
				for (i = 0; i < this.produce.length; i++) {
					lv = produce.level[i];
					this.produce[i].content = this.produce[i].level = lv;
					this.produce[i].interactive = true;
				}
				for (; i < produce.level.length; i++) {
					lv = produce.level[i];
					let tl = text(lv, '30px 微软雅黑', 'blue', 90 + i % 5 * 80, 550 + 50 * parseInt(i / 5), 25);
					tl.level = lv;
					tl.interactive = true;
					tl.release = function () {
						index_g.content.removeAll();
						index_g.content = new ChooseHero(this.level - 1, ui, heroid);
					};
					this.produce.push(tl);
				}
			} else {
				for (i = 0; i < produce.level.length; i++) {
					lv = produce.level[i];
					this.produce[i].content = this.produce[i].level = lv;
					this.produce[i].interactive = true;
				}
			}
			if (i && raffle) {
				this.rf.content = "抽取";
				this.rf.interactive = true;
				this.gk.content = "关卡：";
				this.gk.x = 270;
			} else if (raffle) {
				this.rf.content = "抽取";
				this.rf.interactive = true;
			} else if (i) {
				this.gk.content = "关卡：";
				this.gk.x = 190;
			}
		}
	}

	usE() {
		switch (this.id) {
		}
	}
}

//产地,存放每个id的道具产地，json格式,level关卡，raffle抽奖
let PRODUCTION_PLACE = {
	"1": {level: [1, 211, 354, 447, 123, 2], raffle: 1},
	"2": {level: [1, 211, 354, 447, 123, 2], raffle: 1}
};
