import { assets } from './max/utilities';
import { spritE,stage,text,newMyButton } from './max/display.js';
import { newParagraph } from './paragraph.js';
import { KnapsackProp } from './knapsack_prop.js';
import { Knapsack} from './knapsack.js';
import {boardAssets} from './t0.js';
import {index_g} from './index.js';
import {HeroHandBook,heroif} from './herohandbook.js';
import {Shop} from './shop.js';
import {ChooseLevel} from './chooselevel.js';

export class HeroCard {
	constructor(id, ui) {
		if (ui) {
			index_g.back.alpha = 1;
			index_g.back.release = ()=> {
				this.removeAll();
				if (ui == 'knapsack') index_g.content = new Knapsack();
				else if (ui == "herohandbook") index_g.content = new HeroHandBook();
				else index_g.hideBackAndIndex();
			};
		}
		index_g.index.alpha = 1;
		index_g.bgmoveable = false;
		index_g.title = "herocard";

		this.bg = spritE(assets['images/herotujian_di.png'],  270, 480, 520, 710, 14);
		this.icon = spritE(assets[boardAssets[id]], 120, 300, 200, 200, 15);
		this.name = text(heroif[id].name, '30px 微软雅黑', 'black', 300, 200, 15);
		this.jianjie = newParagraph("英雄简介", {size: 30, color: 'black', x: 390, y: 300, layer: 16});

		//此处应该从存档中读取
		let yongyou = false, level = 1, maxlevel = 3;
		if (yongyou && level < maxlevel) { //如果拥有该英雄则显示升级按钮（没满级的前提下）,使用经验药水
			let levelup = newMyButton(assets['images/hero_levelup.png'], 270, 700, 100, 100, 20);
			levelup.release = ()=> {
			};
			this.lev = levelup;
		} else if (!yongyou) {//没有该英雄，显示“合成”及“抽取”按钮
			let prop = new KnapsackProp();
			this.prop = prop;
			let zsspsl = 0;//专属碎片数量
			let tyspsl = 10;//通用碎片数量
			let zsspxy = 10;//专属碎片所需量
			//合成按钮
			let zsdh = newMyButton(assets['images/hero_hecheng.png'], 150, 610, 100, 100, 15);
			zsdh.release = ()=> {
				if (prop.showing)return;
				//专属碎片足够，或者是可以用万能碎片合成的且万能碎片足够
				if (zsspsl >= zsspxy || (couldUseAlmightyDebris(id) && zsspsl + tyspsl >= zsspxy)) {
					if (hasHeroEquip(id)) {//拥有专属道具，扣除合成材料
					} else {//没有专属道具
					}
				} else {//碎片不足
				}
			};
			this.hecheng = zsdh;
			//专属碎片按钮
			let zhuanshu = text("专属碎片", '30px 微软雅黑', 'blue', 100, 680, 15);
			zhuanshu.interactive = true;
			zhuanshu.release = ()=> {
				if (prop.showing)return;
				prop.show('herocard', debrisOfHero(id), id);
			};
			this.zssp = zhuanshu;
			this.zssl = text(":" + zsspsl + "/" + zsspxy, '30px 微软雅黑', 'black', 205, 680, 15);
			this.zsdaoju = text("专属道具:", '30px 微软雅黑', 'black', 150, 720, 15);
			//专属道具按钮
			let zsdj = text("xxx", '30px 微软雅黑', 'blue', 150, 760, 15);
			zsdj.interactive = true;
			zsdj.release = ()=> {
				if (prop.showing)return;
				prop.show('herocard', hasHeroEquip(id).id, id);
			};
			this.zsdj = zsdj;
			//抽取按钮
			let btgm = newMyButton(assets['images/hero_chouqu.png'], 400, 610, 100, 100, 15);
			btgm.release = ()=> {
				if (prop.showing)return;
				index_g.content = new Shop('herocard', id, 'raffle');
				this.removeAll();
			};
			this.chouqu = btgm;
		}
	}

	removeAll() {
		if (this.prop && this.prop.showing)this.prop.hide();
		stage.removeTrue(this.bg, this.icon, this.name, this.jianjie, this.lev, this.hecheng, this.zssp, this.zssl, this.zsdaoju, this.zsdj, this.chouqu);
	}
}

//判断此英雄能否用万能碎片合成
function couldUseAlmightyDebris(heroid) {
	switch (heroid) {
		case 7:
		case 8:
		case 9:
		case 10:
		case 11:
			return true;
	}
}

//返回该英雄专属碎片的id
function debrisOfHero(heroid) {
	switch (heroid) {
	}
	if (heroid > 6) return heroid - 6;
	else return heroid;
}

//判断背包中是否有这个英雄需要的合成装备,返回对象｛has:true or false,id:那件合成装备的id，site:其所在背包位置｝,has和id必返，site有才返
function hasHeroEquip(heroid) {
	let has, id, site;
	switch (heroid) {
	}
	if (heroid > 6) id = heroid - 6;
	else id = heroid;
	return {has: has, id: id, site: site};
}
