/*
 视图view
 */

import { Sprite,spritE, stage,newMyButton,calcPx,calcYuxiangPx } from './max/display.js';
import { assets } from './max/utilities';
import {tweens,slide,slidePath,fadeOut,fadeIn,pulse,breathe,wobble,scale,strobe,tweenProperty,removeTween} from "./max/tween.js";
import {gamePause,BOARDDATA,boardAssets,gotoIndex} from  './t0.js';
import Score from './score.js';
import Step from './step.js';
import Time from './time.js';
import Skill from './skill.js';
import Mission from './mission.js';
import Boss from './boss.js';
import {newFloatText} from './floattext.js';
import {isAdjacent} from "./board";
import {Gameover} from "./gameover.js";
import {Gameclear} from "./gameclear.js";

export let pause;

export class View {
	constructor(board) {
		this.board = board;
		this.numBlockTypes = board.numBlockTypes;
		this._initBlocks();
		this.cursor = {x: 0, y: 0, selected: false};
		this.animaSpeed = 14;
		this.movepasttime = 0;
		this.score = 0;
		this.skillclick = 0;
		this.skilllaunchnum = 0;
		this.skillclickpoint = [];
		this.energy = board.energy;
		this.selectable = true;
		this.gameover = false;
		this.gameclear = false;
		this.eliminate = board.eliminatedata.concat();//任务消除目标数量以该数组为刷新判断对象
		this.initStage();
	}

	_getBlock(x, y) {
		return this.usedBlocks[`${x},${y}`];
	}

	//获取具体位置（像素单位）
	_getPos(ix, iy) {
		let dx, dy;
		if (ix instanceof Array) {
			dx = [];
			dy = [];
			for (let i = 0; i < ix.length; i++) {
				dx.push(calcPx(35 + 67 * ix[i]));
				dy.push(calcPx(260 + 67 * iy[i], 1));
			}
		} else {
			dx = calcPx(35 + 67 * ix);
			dy = calcPx(260 + 67 * iy, 1);
		}
		return {x: dx, y: dy};
	}

	_initBlocks() {
		this.cachedBlocks = [];
		this.usedBlocks = [];
		//for (let i = 0; i < this.numBlockTypes; i++)
		for (let i = 0; i < boardAssets.length; i++)
			this.cachedBlocks[i] = [];
		// this.usedBlocks[i] = [];
	}

	//设置方块，事件监听
	_setBlock(block, x, y) {
		let dx, dy;
		if (x instanceof Array) {
			x = x.pop();
			y = y.pop();
		}
		dx = 35 + 67 * x;
		dy = 260 + 67 * y;
		block.setPosition(calcPx(dx), calcPx(dy, 1));
		block.ix = x;
		block.iy = y;
		//console.log('-----------------------------1');
		//console.log('** block.parent: ' + block.parent);
		stage.addChild(block);
		// block.draggable = true;
		if (block.type >= 0 && !block.interactive) {
			block.interactive = true;
			let that = this;
			//点击
			block.press = function (target) {
				//console.log(this.type);
				//if(!target.pressable)return;
				that.selectBlockEffect(that.selectBlock(target.ix, target.iy), target);
			};
			//移进
			block.moveIn = function (target) {
				//console.log('moveIn : '+target.ix);
				//console.log('moveIn on: '+target.iy);
				//console.log(that.selectable);
				that.selectBlock(target.ix, target.iy);
				that.selectBlockEffect(false);
			};
			//释放
			block.release = function (target) {
				if (that.skillclick == 9 && that.skillclickpoint.length > 1) {//魔导师
					that.cursor.selected = false;
					that.selectable = false;
					that.selectBlockEffect(false);
					let result = that.calcSorcererSegmentNum();
					that.skilllaunchnum = that.skillclick = 0;
					that.skillclickpoint = [];
					that.board.skillTrigger(9, result, that.boardEventsHandler.bind(that));
				} else if (that.skillclick == 11 && that.skillclickpoint.length > 0) {//弩炮手
					that.cursor.selected = false;
					that.selectable = false;
					that.selectBlockEffect(false);
					that.skilllaunchnum--;
					if (that.skilllaunchnum < 1)that.skillclick = 0;
					that.board.skillTrigger(11, that.skillclickpoint.concat(), that.boardEventsHandler.bind(that));
					that.skillclickpoint = [];
				}
			};
		}
		this.usedBlocks[`${x},${y}`] = block;
		//console.log(`set block [${x},${y}] : ${block} parent: ${block.parent}`);
		//console.log('-----------------------------2');
	}

	_useBlock(type) {
		let block;
		if (type < 0) {// 若方块为空，不是可以放置的方块，type为-1
			block = new Sprite(assets['images/trans.png']);
			block.layer = 10;
			block.type = type;
		} else {
			if (this.cachedBlocks[type].length < 1) {
				let asset;
				asset = assets[boardAssets[type]];
				block = new Sprite(asset);
				block.layer = 10;
				block.type = type;
				this.cachedBlocks[type].push(block);
			}
			block = this.cachedBlocks[type].pop();
		}
		block.alpha = 1;
		block.width = calcPx(60);
		block.height = calcPx(62, 1);
		return block;
	}

	_unuseBlock(block) {
		if (block) {
			if (block.parent) {
				console.log(`remove ${block.ix}, ${block.iy}`);
				stage.removeChild(block);
			}
			if (block.type >= 0) this.cachedBlocks[block.type].push(block);
			// this.usedBlocks.splice(this.usedBlocks.indexOf(block), 1);
			this.usedBlocks[`${block.ix},${block.iy}`] = null;
			block.interactive = false;
		}
		//else {
		//  console.log(`${block} not a 'Block'`);
		//  //throw new Error(`${block} not a 'Block'`);
		//}
	}

	//swap回调函数，接收board发来的视图更新内容
	boardEventsHandler(events) {
		if (events.length <= 0) {
			if (this.board.swaping || this.board.skilltriggering) return;//还在交换中，或者发动技能中，不能再有其他行动
			else return this.selectable = true;
		}
		let boardEvent = events.shift(), next = () => {
			this.boardEventsHandler(events);
		};

		switch (boardEvent.type) {
			case 'swap':
				this.swapBlocks(boardEvent.data, next);
				break;
			case 'remove':
				this.removeBlocks(boardEvent.data, next);
				break;
			case 'move':
				this.moveBlocks(boardEvent.data, next);
				break;
			case 'refill':
				this.refill(boardEvent.data, next);
				break;
			case 'score':
				this.scoreChange(boardEvent.data, next);
				break;
			case 'change':
				this.changeStatus(boardEvent.data, next);
				break;
			case 'bossdamage':
				this.bossDamage(boardEvent.data, next);
				break;
			case 'gameover':
				this.gameOver();
				break;
			case 'clear':
				this.gameClear();
				break;
			case 'goldbeanremove':
				this.removeGoldBean(boardEvent.data, next);
				break;
			case 'over':
				this.turnOver(next);
				break;
			case 'updateskillnum':
				this.skillshow.hideTishi();
				this.skillshow.updateNum(boardEvent.data);
				if (next)next();
				break;
			default:
				next();
				break;
		}
	}

	//对boss造成伤害
	bossDamage(data, callback) {
		for (let i = 0; i < data.length; i++) {
			if (this.bosshp <= 0)break;
			this.bosshp -= data[i];
			newFloatText(data[i], this.boss.x, this.boss.y, "red");
		}
		if (this.bosshp < 0)this.bosshp = 0;
		if (callback)callback();
	}

	//计算魔导师线段数量
	calcSorcererSegmentNum() {
		if (this.skillclick != 9)return;
		let array = this.skillclickpoint;
		if (array.length < 2)return;
		let result = [], ox = array[0].x, oy = array[0].y, x, y, rx = -1, ry = -1, px, py;
		for (let i = 1; i < array.length; i++) {
			x = array[i].x;
			y = array[i].y;
			if (ox == x)rx = x;
			else if (oy == y)ry = y;
			if (rx >= 0 || ry >= 0) {
				let rlength = result.length;
				if (!rlength)result.push({x: rx, y: ry});
				else {
					px = result[rlength - 1].x;
					py = result[rlength - 1].y;
					if (rx != px || ry != py)result.push({x: rx, y: ry});
				}
				if (result.length == this.skilllaunchnum)return result;
				rx = ry = -1;
			}
			ox = x;
			oy = y;
		}
		return result;
	}

	//改变状态,block，表面，背景
	changeStatus(data, callback) {
		for (let i = 0; i < data.length; i++) {
			let x = data[i].x;
			let y = data[i].y;
			let dt = data[i].data;//要变化成的类型，即最终显示的类型
			let type = data[i].type;
			let edt = data[i].edata;//消除的方块类型
			if (type == 'bl') {
				let block = this._getBlock(x, y);
				this._unuseBlock(block);
				block = this._useBlock(dt);
				this._setBlock(block, x, y);
			} else if (type == 'bd') {
				let bg = this.blockbg[x][y];
				switch (dt) {
					case 1:
						bg.createFromImage(assets['images/trans.png']);
						if (edt)this.eliminate[edt]++;
						break;
					case 2:
						bg.createFromImage(assets['images/fk_ice1.png']);
						break;
				}
				bg.width = bg.height = 66;
			} else if (type == 'sf') {
				let br = this.barrier[x][y];
				switch (dt) {
					case 1:
						br.createFromImage(assets['images/trans.png']);
						if (edt)this.eliminate[edt]++;
						break;
					case 3:
						br.createFromImage(assets['images/fk_nikuai.png']);
						break;
				}
				br.width = br.height = 66;
			}
		}
		if (callback)callback();
	}

	clearBlocks(board = this.board) {
		for (let x = 0; x < board.cols; x++) {
			for (let y = 0; y < board.rows; y++) {
				let b = this._getBlock(x, y);
				this._unuseBlock(b);
			}
		}
	}

	gameClear() {
		this.selectable = false;
		this.gameclear = true;
		stage.add(new Gameclear(this.board));
		//alert("game clear");
		//gotoIndex();
	}

	gameOver() {
		this.selectable = false;//时间到结束须加此句
		if (this.board.mission == null)  return this.gameClear();
		this.gameover = true;
		//alert("game over");
		//gotoIndex();
		stage.add(new Gameover(this.board));
	}

	//提示可消除方块，要怎么提示目前还没有定
	hintEliminate(board) {
		this.movepasttime = 0;
		if (this.gameclear || this.gameover)return;
		let p = board._hasMoves();//移动后可以消除的方块,{x,y},列，行
		let p2 = p.p2;//需要和p方块换位的方块,{x,y},列，行
	}

	initStage() {
		//背景
		spritE(assets['images/bg1_1.png'], 270, 480, 540, 960);
		spritE(assets['images/bg1_2.png'], 270, 480, 540, 960, 1);
		spritE(assets['images/bg1_3.png'], 270, 480, 540, 960, 2);
		spritE(assets['images/bg1_4.png'], 270, 480, 540, 960, 3);
		//选中框
		this.frame = spritE(assets['images/frame.png'], -99, 0, 67, 67, 15);
		stage.addChild(this.frame);
		//暂停按钮
		pause = newMyButton(assets['images/pause.png'], 500, 40, 60, 60, 5);
		pause.release = gamePause;
		//分数
		stage.addChild(new Score(this));
		//步数
		if (this.board.stepslimit)stage.addChild(new Step(this.board));
		//时间限制
		if (this.board.time)stage.addChild(new Time(this.board));
		//过关任务
		this.mission = new Mission(this);
		stage.addChild(this.mission);
		//技能
		this.skillshow = new Skill(this);
		stage.addChild(this.skillshow);
		//boss
		if (this.board.boss) {
			this.boss = new Boss(this);
			stage.add(this.boss);
			this.bosshp = this.board.boss.hp;
		}
	}

	moveBlocks(movedBlocks, callback) {
		let n = movedBlocks.length, mover, i;
		if (!n && callback)callback();
		//console.log('moveblocks: ' + movedBlocks);
		let tn = 0;
		for (let i = 0; i < movedBlocks.length; i++) {
			let b = movedBlocks[i];
			let block = this._getBlock(b.fromX, b.fromY);
			let fromP = this._getPos(b.fromX, b.fromY);
			let toP = this._getPos(b.toX, b.toY);
			this.missionClearJudge(b);
			//console.log('move block: ' + block);
			if (!block) {
				// console.log('x------------------x: ' + b.fromX);
				// console.log('y------------------y: ' + b.fromY);
				// console.log('type------------------type: ' + b.type);
				block = this._useBlock(b.type);
				block.setPosition(fromP.x, fromP.y);
				stage.addChild(block);
				//console.log('---fromP.y: ' + fromP.y);
			}
			tn++;
			//slide(block, toP.x, toP.y, animaSpeed).onComplete = () => {//原版
			slidePath(block, toP.x, toP.y, this.animaSpeed).onComplete = () => {
				this._setBlock(block, b.toX, b.toY);
				if (--tn == 0) {
					this.movepasttime = 0;
					this.board.print();
					if (callback) callback();
				}
			};
			//this.board.print();
			//if(callback)callback();
		}

		// this.resetBlocks();
		// if(callback)
		//   callback();
	}

	//判断逃出任务是否完成
	missionClearJudge(block) {
		let tox = block.toX, toy = block.toY, fx = block.fromX, fy = block.fromY;
		let type = this.board.getBlock(getFinalBit(tox), getFinalBit(toy));
		let mission = this.board.mission;
		if (!this.board.isHero(type) || mission.type != 'escape' || this.missionclear)return;
		let data = mission.data;
		let x = data.x, y = data.y;
		if (tox instanceof Array) {//移动数格
			let tx, ty;
			for (let i = 0; i < tox.length; i++) {
				tx = tox[i];
				ty = toy[i];
				if (fx == tx) {//直线下落
					if (x == fx && betweenDouble(y, fy, ty))return this.missionclear = true;
				} else if (betweenDouble(x, fx, tx) && betweenDouble(y, fy, ty)) {//斜线
					let j = fx;
					for (let k = fy + 1; k <= ty; k++) {
						if (tx > fx) j++;
						else j--;
						if (x == j && y == k)return this.missionclear = true;
					}
				}
				fx = tx;
				fy = ty;
			}
		} else if (tox == x && toy == y)this.missionclear = true;//移动一格
	}

	refill(blocks, callback) {
		this.resetBlocks();
		console.log('reset blocks--------------------------------------------------***');
		if (callback) callback();
	}

	removeBlocks(removedBlocks, callback) {
		// TODO
		if (!removedBlocks.length && callback)callback();
		//console.log('removeblocks: ' + removedBlocks);
		let tn = 0;
		for (let i = 0; i < removedBlocks.length; i++) {
			let b = removedBlocks[i];
			let type = b.type;
			if (type < this.numBlockTypes) {
				this.eliminate[type]++;
				if (type == this.board.getColor(this.board.hero.id) && this.energy < this.board.hero.energy)  this.energy++;
			} else if (type == 7) {
				this.eliminate[7]++;
			}
			let block = this._getBlock(b.x, b.y);
			tn++;
			let tween = fadeOut(block, this.animaSpeed);
			tween.onComplete = ()=> {
				this._unuseBlock(block);
				//console.log('unuse block: ' + block);
				// removeTween(pulse0);
				if (--tn == 0 && callback)  callback();
			};
		}
		// this.resetBlocks();
		// if(callback)
		//   callback();
	}

	removeGoldBean(data, callback) {
		this.removeBlocks(data, callback);
	}

	//重置所有方块，初始化时会调用
	resetBlocks(board = this.board) {
		this.clearBlocks(board);
		this.blockbg = [];
		this.barrier = [];
		for (let x = 0; x < board.cols; x++) {
			this.blockbg[x] = [];
			this.barrier[x] = [];
			for (let y = 0; y < board.rows; y++) {
				let block = this._useBlock(board.getBlock(x, y));
				// let block = new Sprite(assets[boardAssets[(board.getBlock(x, y))]]);
				this._setBlock(block, x, y);
				//wobble(block, 1.1, 1.1, 10);
				block.alpha = 0;
				fadeIn(block);

				let grid = true, bg, img, p = this._getPos(x, y), br, boardtype = board.getBoardData(x, y);//动物下面的背景
				p.x = calcYuxiangPx(p.x);
				p.y = calcYuxiangPx(p.y, 1);
				if (boardtype < 1) grid = false;//不放置格子
				img = assets['images/trans.png'];
				switch (boardtype) {
					case 2:
						img = assets['images/fk_ice1.png'];
						break;
					case 3:
						img = assets['images/fk_ice2.png'];
						break;
					case 4:
						img = assets['images/fk_door.png'];
						grid = false;
						break;
					case 5:
						grid = false;
						break;
				}
				bg = spritE(img, p.x, p.y, 66, 66, 9);
				this.blockbg[x][y] = bg;

				img = assets['images/trans.png'];
				//动物上层的障碍物
				switch (board.getSurface(x, y)) {
					case 2:
						img = assets['images/fk_ice3.png'];
						break;
					case 3:
						img = assets['images/fk_nikuai.png'];
						break;
					case 4:
						img = assets["images/fk_suolian.png"];
						break;
					case 5:
						img = assets["images/fk_cunmin.png"];
						break;
				}
				br = spritE(img, p.x, p.y, 66, 66, 11);
				this.barrier[x][y] = br;

				if (grid) {
					spritE(assets['images/grid.png'], p.x, p.y, 66, 66, 8);
				}
			}
		}
		// console.log('stage: '+stage.children.length);
		// console.log('this.cachedBlocks[0].length: '+this.cachedBlocks[0].length);
		// console.log('this.cachedBlocks[1].length: '+this.cachedBlocks[1].length);
		// console.log('this.cachedBlocks[2].length: '+this.cachedBlocks[2].length);
		// console.log('this.cachedBlocks[3].length: '+this.cachedBlocks[3].length);
		// console.log('this.cachedBlocks[4].length: '+this.cachedBlocks[4].length);
		// console.log('this.cachedBlocks[5].length: '+this.cachedBlocks[5].length);
		// board.print();
	}

	scoreChange(data, callback) {
		for (let i = 0; i < data.length; i++) {
			let score = data[i].score;
			this.turnscore += score;
			this.score += score;
			let color = "gold";
			switch (data[i].type) {
				case 0:
					color = 'silver';
					break;
				case 1:
					color = 'green';
					break;
				case 2:
					color = 'purple';
					break;
				case 3:
					color = 'black';
					break;
				case 4:
					color = 'yellow';
					break;
			}
			newFloatText(score, 35 + 67 * data[i].x, 260 + 67 * data[i].y, color);
		}
		//console.log("score:"+this.score);
		if (callback)callback();
	}

	//选中方块触发，移动方块也触发
	selectBlock(x, y, board = this.board) {
		if (!this.selectable)return;
		if (arguments.length == 0)   return this.selectBlock(this.cursor.x, this.cursor.y);

		this.turnscore = 0;//一步增加的分数
		if (this.cursor.selected) {//已经有方块被选中了
			let dx = abS(x - this.cursor.x), dy = abS(y - this.cursor.y), dist = dx + dy;
			if (this.skillclick == 3 || this.skillclick == 5) {//触发符文师的交换，猎人的一行消除
				let p1 = this.skillclickpoint[0];
				this.skillclickpoint = [];
				this.cursor.selected = false;
				//两次点的是相同的方块
				if (p1.x == x && p1.y == y) {
					this.skillclick = 0;
					return;
				}
				if (this.skillclick == 3) {//符文师交换英雄时，只能移动一格
					let t1 = this.board.getBlock(p1.x, p1.y), t2 = this.board.getBlock(x, y);
					if ((this.board.isHero(t1) || this.board.isHero(t2)) && !isAdjacent(p1.x, p1.y, x, y)) {
						alert("英雄只能移动一格");
						this.skillclick = 0;
						return;
					}
				}
				this.selectable = false;
				this.selectBlockEffect(false);
				board.skillTrigger(this.skillclick, {p: p1, p2: {x: x, y: y}}, this.boardEventsHandler.bind(this));
				this.skillclick = 0;
				return this.setCursor(x, y, false);
			} else if (this.skillclick == 9 || this.skillclick == 11) {//选择多个方块的技能
				return this.setCursor(x, y, true);
			} else if (dist == 1) {
				this.selectable = false;
				this.skillclickpoint = [];
				board.swap(this.cursor.x, this.cursor.y, x, y, this.boardEventsHandler.bind(this));
				return this.setCursor(x, y, false);
			} else  return this.setCursor(x, y, true);
		} else  return this.setCursor(x, y, true);
	}

	//trueorfalse控制选中框是否显示，o为选中目标
	selectBlockEffect(trueorfalse, o) {
		if (trueorfalse) {
			let point = this._getPos(o.ix, o.iy);
			this.frame.x = point.x;
			this.frame.y = point.y;
		} else   this.frame.x = -100;
	}

	setCursor(x, y, selected = false) {
		console.log(`[${x},${y}] ${this._getBlock(x, y).type} selected: ${selected}`);
		if (arguments.length > 0) {
			Object.assign(this.cursor, {x, y, selected});
			if (selected) {
				if (isMonoSkill(this.skillclick)) {//是单体技能
					this.cursor.selected = false;
					this.selectable = false;
					this.selectBlockEffect(false);
					if (this.skilllaunchnum)this.skilllaunchnum--;
					this.board.skillTrigger(this.skillclick, {x: x, y: y, view: this}, this.boardEventsHandler.bind(this));
					if (this.skilllaunchnum < 1) this.skillclick = 0;
					return;
				} else {//不是单体技能
					let length = this.skillclickpoint.length;//push之前的point长度
					if (length) {
						let p = this.skillclickpoint[length - 1];
						if ((p.x != x || p.y != y) && isAdjacent(p.x, p.y, x, y)) this.skillclickpoint.push({x: x, y: y});
					} else this.skillclickpoint.push({x: x, y: y});
					console.log("x:" + x + ",y:" + y + ",length:" + length);
					if (this.skillclick == 9) {//魔导师，连线消除
						let result = this.calcSorcererSegmentNum();
						if (result && result.length) {
							this.skillshow.updateNum(this.skilllaunchnum - result.length);
							if (result.length == this.skilllaunchnum) {
								this.cursor.selected = false;
								this.selectable = false;
								this.selectBlockEffect(false);
								this.skilllaunchnum = this.skillclick = 0;
								this.skillclickpoint = [];
								this.board.skillTrigger(9, result, this.boardEventsHandler.bind(this));
								return;
							}
						}
					} else if (this.skillclick == 11 && length > 1) {//弩炮手
						this.cursor.selected = false;
						this.selectable = false;
						this.selectBlockEffect(0);
						this.skilllaunchnum--;
						if (this.skilllaunchnum < 1)this.skillclick = 0;
						this.board.skillTrigger(11, this.skillclickpoint.concat(), this.boardEventsHandler.bind(this));
						this.skillclickpoint = [];
						return;
					}
				}
			}
		} else  this.cursor = null;
		return selected;
	}

	swapBlocks(data, callback) {
		let block1 = this._getBlock(data.x1, data.y1);
		let block2 = this._getBlock(data.x2, data.y2);
		this.missionClearJudge({fromX: data.x1, fromY: data.y1, toX: data.x2, toY: data.y2});
		this.missionClearJudge({fromX: data.x2, fromY: data.y2, toX: data.x1, toY: data.y1});
		let p1 = this._getPos(data.x1, data.y1), p2 = this._getPos(data.x2, data.y2);
		let tn = 2;
		slide(block1, p2.x, p2.y, this.animaSpeed).onComplete = () => {
			if (block1)  this._setBlock(block1, data.x2, data.y2);
			if (--tn == 0) if (callback) callback();
		};
		slide(block2, p1.x, p1.y, this.animaSpeed).onComplete = () => {
			if (block2)  this._setBlock(block2, data.x1, data.y1);
			if (--tn == 0) if (callback) callback();
		};
	}

	//一步结束，播放音效（得分不同）
	turnOver(callback) {
		if (this.missionclear) {
			let event = [];
			this.board.hasClearMission(event, 1);
			this.boardEventsHandler(event);
			return;
		}
		if (callback)callback();
	}
}

function getFinalBit(a) {
	if (a instanceof Array)return a[a.length - 1];
	else return a;
}

function abS(a) {
	return a < 0 ? -a : a;
}

//检测x是否在a1到a2这个区间
function betweenDouble(m, a1, a2) {
	if (a1 > a2) {
		let t = a1;
		a1 = a2;
		a2 = t;
	}
	return (m >= a1 && m <= a2);
}

//判断是否为单体技能
function isMonoSkill(a) {
	if (!a)return 0;
	switch (a) {
		case 1:
		case 4:
		case 7:
		case 10:
			return 1;
	}	//3,5,9,11
}