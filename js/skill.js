import { assets } from './max/utilities';
import { Sprite,spritE,text,stage,newMyButton } from './max/display.js';

export default class Skill extends Sprite {
	constructor(view) {
		super(assets['images/trans.png']);
		
		this.view = view;
		let board = view.board;
		this.board = board;
		
		//职业技能
		let zy1 = spritE(assets['images/fk0.png'], 60, 900, 55, 55, 10);
		zy1.id = 1;
		stage.add(zy1);
		zy1.interactive = true;
		zy1.press = triggerSkill;
		this.sk1 = text("1", '20px 微软雅黑', 'white', 85, 930, 10);

		let zy2 = spritE(assets['images/fk1.png'], 115, 845, 55, 55, 10);
		zy2.id = 2;
		stage.add(zy2);
		zy2.interactive = true;
		zy2.press = triggerSkill;
		this.sk2 = text("1", '20px 微软雅黑', 'white', 142, 870, 10);

		let zy3 = spritE(assets['images/fk2.png'], 185, 900, 55, 55, 10);
		zy3.id = 3;
		stage.add(zy3);
		zy3.interactive = true;
		zy3.press = triggerSkill;
		this.sk3 = text("1", '20px 微软雅黑', 'white', 212, 930, 10);

		let zy4 = spritE(assets['images/fk3.png'], 245, 845, 55, 55, 10);
		zy4.id = 4;
		stage.add(zy4);
		zy4.interactive = true;
		zy4.press = triggerSkill;
		this.sk4 = text("1", '20px 微软雅黑', 'white', 272, 871, 10);

		let zy5 = spritE(assets['images/fk4.png'], 315, 900, 55, 55, 10);
		zy5.id = 5;
		stage.add(zy5);
		zy5.interactive = true;
		zy5.press = triggerSkill;
		this.sk5 = text("1", '20px 微软雅黑', 'white', 343, 930, 10);

		//主角技能
		let zj = spritE(assets['images/skill.png'], 445, 850, 130, 130, 10);
		zj.id = board.hero.id;
		zj.level = board.hero.level;
		zj.interactive = true;
		zj.press = triggerSkill;
		this.zjs = text("", '50px 微软雅黑', 'white', 480, 840, 11);
		this.zjs.align = "center";
		this.energy = text("", '30px 微软雅黑', 'white', 480, 935, 11);
		this.energy.align = "center";
		this.heroenergy = board.hero.energy;

		let that = this;
		this.skilltishi = newMyButton(assets["images/frame.png"], -100, 0, 58, 58, 11);

		this.updateNum();
		
		function triggerSkill() {
			if (!view.selectable)return;
			switch (this.id) {
				case 1://战士
					if (view.skillclick == 8) {
						if (board.sk_warrior > 8) return;
						board.sk_warrior++;
					}
					if (board.sk_warrior < 1)return;
					break;
				case 2://牧师
					if (view.skillclick == 8) {
						if (board.sk_priest > 8) return;
						board.sk_priest++;
					}
					if (board.sk_priest < 1)return;
					break;
				case 3://符文师
					if (view.skillclick == 8) {
						if (board.sk_rune_keeper > 8) return;
						board.sk_rune_keeper++;
					}
					if (board.sk_rune_keeper < 1)return;
					break;
				case 4://盗贼
					if (view.skillclick == 8) {
						if (board.sk_robber > 8) return;
						board.sk_robber++;
					}
					if (board.sk_robber < 1)return;
					break;
				case 5://猎人
					if (view.skillclick == 8) {
						if (board.sk_hunter > 8) return;
						board.sk_hunter++;
					}
					if (board.sk_hunter < 1)return;
					break;
			}
			if (view.skillclick == 8 && this.id < 6) {//博学大师加技能点后刷新
				view.skilllaunchnum--;
				if (view.skilllaunchnum < 1)view.skillclick = 0;
				//如果所有技能都加到9点了，就取消博学大师的技能
				else if (board.sk_hunter > 8 && board.sk_priest > 8 && board.sk_robber > 8 && board.sk_rune_keeper > 8 && board.sk_warrior > 8) {
					view.skillclick = 0;
					view.skilllaunchnum = 0;
					that.hideTishi();
				}
				that.updateNum();
				return;
			}

			if (this.id > 6) {//主角技能不能取消，且会被职业技能覆盖
				if (!board.sk_player)return;
				board.sk_player = false;//点击就发动，并将能量置零
				board.energy = view.energy = 0;
				switch (this.id) {
					case 7://魔爆师
					case 8://博学大师
					case 9://魔导师
						if (this.level > 2)view.skilllaunchnum = 4;
						else if (this.level > 1)view.skilllaunchnum = 3;
						else view.skilllaunchnum = 2;
						break;
					case 10://偷盗大师
						if (this.level > 2)view.skilllaunchnum = 3;
						else if (this.level > 1)view.skilllaunchnum = 2;
						else view.skilllaunchnum = 1;
						break;
					case 11://弩炮手
						if (this.level > 2)view.skilllaunchnum = 5;
						else if (this.level > 1)view.skilllaunchnum = 4;
						else view.skilllaunchnum = 3;
						break;
					case 12://符文音阶少女
						if (this.level > 2)view.skilllaunchnum = 'oo';//小写o字母，两个像无穷大
						else if (this.level > 1)view.skilllaunchnum = 8;
						else view.skilllaunchnum = 5;
						break;
				}
			}

			view.cursor.selected = false;
			view.selectBlockEffect(false);
			if (view.skillclick == this.id) {//点相同技能取消
				that.hideTishi();
				return view.skillclick = 0;
			}

			if (this.id != 2 && this.id != 12) {//立即生效的技能不需要标注
				that.skilltishi.x = this.x;
				that.skilltishi.y = this.y;
				that.skilltishi.width = this.width + 2;
				that.skilltishi.height = this.height + 2;
			}
			view.skillclick = this.id;
			if (this.id < 6)view.skilllaunchnum = 0;
			if (this.id == 2) {
				view.skillclick = 0;
				board.skillPriest();
			} else if (this.id == 8 && board.sk_hunter > 8 && board.sk_priest > 8 && board.sk_robber > 8 && board.sk_rune_keeper > 8 && board.sk_warrior > 8) {
				view.skillclick = 0;
				view.skilllaunchnum = 0;
			} else if (this.id == 12) {
				view.downable = false;
				view.skillclick = 0;
				board.skillTrigger(12, view, view.boardEventsHandler.bind(view));
			}
			that.updateNum();
		}
	}

	hideTishi() {
		this.skilltishi.x = -200;
	}

	myAction() {
		this.energy.content = Math.round(this.view.energy / this.heroenergy * 100) + "%";
	}
	
	updateNum(skillnum) {
		this.sk1.content = this.board.sk_warrior;
		this.sk2.content = this.board.sk_priest;
		this.sk3.content = this.board.sk_rune_keeper;
		this.sk4.content = this.board.sk_robber;
		this.sk5.content = this.board.sk_hunter;
		if (skillnum)this.zjs.content = skillnum;
		else if (this.view.skilllaunchnum) this.zjs.content = this.view.skilllaunchnum;
		else this.zjs.content = "";
	}
}