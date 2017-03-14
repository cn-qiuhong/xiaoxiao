/*
 表格逻辑
 */

export default class Board {
	constructor(ops, callback) {
		this.ops = ops;
		this.numBlockTypes = ops.numBlockTypes || 5;//基础消除方块类型数
		this.baseScore = ops.baseScore || 300;//基础分
		this.cols = ops.cols || 8;//列数
		this.rows = ops.rows || 8;//行数
		this.stepslimit = ops.stepslimit;//步数限制
		this.stepsorigin = this.stepslimit;
		this.time = ops.time;//限制时间（秒数）,不传时间就没有限制
		this.remainingtime = ops.time;//剩余游戏时间
		this.usetime = 0;//已用时间
		this.level = ops.level;//关卡等级
		this.score = 0;//得分
		this.sk_warrior = 1;//战士
		this.sk_priest = 1;//牧师
		this.sk_rune_keeper = 1;//符文师
		this.sk_robber = 1;//盗贼
		this.sk_hunter = 1;//猎人
		this.sk_player = true;//主角技能
		this.energy = ops.hero.energy;//当前能量
		this.eliminatedata = [];//消除的方块数，0-4职业方块5薄冰6泥块7小猪喽啰
		for (let i = 0; i < 8; i++) this.eliminatedata[i] = 0;
		this.blocks = null;
		this.gameing = true;
		this.gameover = false;
		this.initBoardData(ops);
		this.initSurface(ops);
		this.initMission(ops.mission);
		this._fillBoard(ops.blocks, ops.hero);
		if (callback) callback();
	}

	//查询一个方块是否能移动
	_canBlockMove(x, y, arg) {
		//return ((x > 0 && this.canSwap(x, y, x - 1, y)) ||
		//(x < this.cols - 1 && this.canSwap(x, y, x + 1, y)) ||
		//(y > 0 && this.canSwap(x, y, x, y - 1)) ||
		//(y < this.rows - 1 && this.canSwap(x, y, x, y + 1)));
		if (x > 0 && this.canSwap(x, y, x - 1, y, arg))return {x: x - 1, y: y};
		if (x < this.cols - 1 && this.canSwap(x, y, x + 1, y, arg))return {x: x + 1, y: y};
		if (y > 0 && this.canSwap(x, y, x, y - 1, arg))return {x: x, y: y - 1};
		if (y < this.rows - 1 && this.canSwap(x, y, x, y + 1, arg))return {x: x, y: y + 1};
		return false;
	}

	//检查是否能消除
	_check(events = [], p1 = null, p2 = null) {
		let chains = this._getChains(), hadChains = false, type1, type2,
			removed = [], moved = [], changed = [], goldbeanremove = [], score = [], bossdamage = [];
		let ops = {event: events, removed: removed, changed: changed, bossdamage: bossdamage, score: score, p1: p1, p2: p2};
		this.chaincopy = chains;
		this.scorechain = chains;
		this.blocksCopy();
		if (this.goldbeanget > 1)this.goldbeanget--;
		if (this.zhulouluotime > 0)this.zhulouluotime--;
		
		if (p1) {
			type1 = this.getBlock(p1.x, p1.y);
			type2 = this.getBlock(p2.x, p2.y);
		}

		if (type1 == 5 || type2 == 5) {//触发彩色猫头鹰效果
			hadChains = true;
			if (type1 == 5) {
				this.setBlock(p1.x, p1.y, -2);
				removed.push({x: p1.x, y: p1.y, type: type1});
				this.changeBoardData(p1.x, p1.y, changed);
				type2 = this.getColor(p2.x, p2.y);
			} else if (type2 == 5) {
				this.setBlock(p2.x, p2.y, -2);
				removed.push({x: p2.x, y: p2.y, type: type2});
				this.changeBoardData(p2.x, p2.y, changed);
				type2 = this.getColor(p1.x, p1.y);
			}
			if (type2 == 5) {//两个都是猫头鹰
				this.setBlock(p2.x, p2.y, -2);
				removed.push({x: p2.x, y: p2.y, type: type2});
				bossdamage.push(10);
				this.changeBoardData(p2.x, p2.y, changed);
			} else if (type2 == 6)return;//有一个是金豆
			for (let x = 0; x < this.cols; x++) {
				for (let y = 0; y < this.rows; y++) {
					if ((type2 < this.numBlockTypes && this.getBlock(x, y) == type2) || type2 == 5)this.triggerEffectSquare(x, y, ops);
				}
			}
		} else {//没有触发彩色猫头鹰效果
			for (let x = 0; x < this.cols; x++) {//从左到右,一列一列的查看
				for (let y = this.rows - 1; y >= 0; y--) {//每列都是从下到上的顺序
					if (chains[x][y] > 2) {
						hadChains = true;
						this.triggerEffectSquare(x, y, ops);
					}
				}
			}
		}

		for (let i = 0; i < score.length; i++)this.score += score[i].score;
		this.moveGapSquareAll(moved, goldbeanremove);
		this.createNewSquare(moved, goldbeanremove);
		this.zhulouluoDibuPanding();

		if (hadChains) {
			events.push({type: 'remove', data: removed},
				{type: 'change', data: changed},
				{type: 'bossdamage', data: bossdamage},
				{type: 'score', data: score},
				{type: 'move', data: moved},
				{type: 'goldbeanremove', data: goldbeanremove});
			if (this.gameover)events.push({type: "gameover"});
			if (!this._hasMoves()) {
				this._fillBoard();
				events.push({type: 'refill', data: this.getBoard()});
			}
			return this._check(events);
		} else {
			events.push({type: 'over'});
			this.hasClearMission(events);
			if (this.gameover)events.push({type: "gameover"});
			return events;
		}
	}

	//查询该点的最大连接数，返回一个数
	_checkChain(x, y) {
		let type = this.getColor(x, y), left = 0, right = 0, down = 0, up = 0;
		if (type < 0)return 0;
		if (type > 6)type = this.getColor(type);
		while (type === this.getColor(x + right + 1, y)) right++;
		while (type === this.getColor(x - left - 1, y)) left++;
		while (type === this.getColor(x, y + down + 1)) down++;
		while (type === this.getColor(x, y - up - 1)) up++;

		return Math.max(left + 1 + right, up + 1 + down);
	}

	//查询该点的具体连接数，返回值是对象，包含横纵连接数
	_checkChainDetailed(x, y) {
		let type = this.getCopyBlock(x, y), left = 0, right = 0, down = 0, up = 0;
		if (type < 0)return 0;
		if (type > 6)type = this.getColor(type);
		while (type === this.getColor(x + right + 1, y)) right++;
		while (type === this.getColor(x - left - 1, y)) left++;
		while (type === this.getColor(x, y + down + 1)) down++;
		while (type === this.getColor(x, y - up - 1)) up++;

		let row = left + 1 + right, col = up + 1 + down;
		return {row: row, col: col};
	}

	_checkCopyChain(x, y) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1)  return -1;
		return this.chaincopy[x][y];
	}

	//surface有值时不再把block置为-1，填充表格,初始化时调用
	_fillBoard(blocks, hero) {
		let type;
		this.blocks = [];
		let goldbeanx;
		if (this.mission && this.mission.type == 'cellect') {//有收集金豆荚的任务
			do goldbeanx = parseInt(Math.random() * this.cols);
			while (this.getBoardData(goldbeanx, 0) <= 0 || this.getSurface(goldbeanx, 0) > 1 || (blocks && blocks[0][goldbeanx] > 9));
		}
		let herosite;
		if (hero) {//有主角
			this.hero = hero;
			//不能取的值请参考各数据初始化的部分
			do herosite = parseInt(Math.random() * this.cols);
			while (this.getBoardData(herosite, 0) <= 0 || this.getBoardData(herosite, 0) == 5 || this.getSurface(herosite, 0) > 1 || herosite == goldbeanx || this.inBossSite(herosite, 0));
		}
		let zllsite;
		if (this.zhulouluo) {
			if (Math.random() < 0.2) {//猪喽啰,在第一层有一个
				do zllsite = parseInt(Math.random() * this.cols);
				while (this.getBoardData(zllsite, 0) <= 0 || this.getBoardData(zllsite, 0) == 5 || this.getSurface(zllsite, 0) > 1 || zllsite == goldbeanx || this.inBossSite(zllsite, 0) || zllsite == herosite);
			}
			this.zhulouluotime = parseInt(Math.random() * 4 + 2);
		}
		for (let x = 0; x < this.cols; x++) {//blocks列是第一维，行是第二维
			this.blocks[x] = [];
			for (let y = 0; y < this.rows; y++) {
				let bd = this.getBoardData(x, y), sf = this.getSurface(x, y);
				//方块传送门
				if (bd == 5) {
					this.setBlock(x, y, -2);
					if (this.inBossSite(x, y)) {
						this.setBoardData(x, y, 0);
						this.setBlock(x, y, -1);
					}
					continue;
				}
				//不放基本方块：背景是空，是boss的位置，被雪覆盖，是村民
				if (bd <= 0 || this.inBossSite(x, y) || sf == 2 || sf == 5) {
					this.setBlock(x, y, -1);
					if (this.inBossSite(x, y))this.setBoardData(x, y, 0);
					continue;
				}
				if (blocks) {//指定方块
					this.setBlock(x, y, blocks[y][x]);
					continue;
				}
				if (x == goldbeanx && y == 0) {//金豆
					this.setBlock(x, y, 6);
					continue;
				}
				else if (x == herosite && y == 0) {//主角
					this.setBlock(x, y, hero.id);
					continue;
				}
				else if (x == zllsite && y == 0) {
					this.setBlock(x, y, 13);
					continue;
				}
				do  type = randomBlock.call(this);
				while ((type === this.getColor(x - 1, y) &&
				type === this.getColor(x - 2, y)) ||
				(type === this.getColor(x, y - 1) &&
				type === this.getColor(x, y - 2)));
				this.setBlock(x, y, type);
			}
		}
		if (!this._hasMoves())  this._fillBoard();
	}

	// returns a two-dimensional map of chain-lengths
	_getChains() {
		let chains = [];
		for (let x = 0; x < this.cols; x++) {
			chains[x] = [];
			for (let y = 0; y < this.rows; y++)
				chains[x][y] = this._checkChain(x, y);
		}
		return chains;
	}

	//有达成消除的交换方法
	_hasMoves(arg) {
		for (let x = 0; x < this.cols; x++)
			for (let y = 0; y < this.rows; y++) {
				let result = this._canBlockMove(x, y, arg);
				if (result) return {x: x, y: y, p2: result};
			}
		return false;
	}

	blocksCopy() {
		this.blockscopy = [];
		for (let i = 0; i < this.cols; i++)this.blockscopy[i] = this.blocks[i].concat();
	}

	boarddataCopy() {
		this.bdcopy = [];
		for (let i = 0; i < this.rows; i++)this.bdcopy[i] = this.boarddata[i].concat();
	}

	//boss技能发动
	bossSkillLaunch(time, view) {
		this.bossjishi += time;
		if (this.bosstype == 1 && this.bossjishi >= 10000) {//泥浆史莱姆
			this.bossjishi -= 10000;
			//随机找寻两个能放泥浆的地方
			let num = 0;
			let event = [], changed = [];
			for (let i = 0; i < 15; i++) {
				let x = parseInt(Math.random() * this.cols), y = parseInt(Math.random() * this.rows);
				if (this.getBlock(x, y) >= 0 && this.getBlock(x, y) < 5 && this.getSurface(x, y) == 1) {
					this.setSurface(x, y, 3);
					this.nikuaitime[x][y] = 0;
					changed.push({x: x, y: y, data: 3, type: "sf"});
					if (num > 0)break;
					num++;
				}
			}
			if (changed.length > 0) {
				event.push({type: "change", data: changed});
				view.boardEventsHandler(event);
			}
		}
	}

	//判断能否交换
	canSwap(x1, y1, x2, y2, arg) {
		if (!isAdjacent(x1, y1, x2, y2))  return false;
		let type1 = this.getBlock(x1, y1), type2 = this.getBlock(x2, y2), chain,
			bdt1 = this.getBoardData(x1, y1), bdt2 = this.getBoardData(x2, y2),
			sf1 = this.getSurface(x1, y1), sf2 = this.getSurface(x2, y2);
		if (type1 == -1 || type2 == -1 || type1 == type2 || bdt1 == 5 || bdt2 == 5 || sf1 > 1 || sf2 > 1)return false;
		//如果已经连成三个就不管了
		if (this._checkChain(x2, y2) > 2 || this._checkChain(x1, y1) > 2)return false;
		// 先交换然后检查能否形成链
		this.setBlock(x1, y1, type2);
		this.setBlock(x2, y2, type1);
		let chain1 = this._checkChain(x1, y1), chain2 = this._checkChain(x2, y2);
		if (arg) {//指定连线个数必须满足,且不能有超过连线个数的情况
			this.chaincopy = this._getChains();
			this.scorechain = this._getChains();
			this.blocksCopy();
			switch (arg) {
				case 3:
				case 4:
					if ((chain1 > arg || chain2 > arg) || this.createESBLJ(x1, y1, 3) || this.createESBLJ(x2, y2, 3))chain = false;
					else chain = (chain1 == arg || chain2 == arg);
					break;
				case 5:
					chain = (chain1 == arg || chain2 == arg || this.createESBLJ(x1, y1, 3) || this.createESBLJ(x2, y2, 3));
					break;
			}
		} else chain = (chain1 > 2 || chain2 > 2);
		// 还原
		this.setBlock(x1, y1, type1);
		this.setBlock(x2, y2, type2);
		return chain;
	}

	//改变boarddata和surface
	changeBoardData(x, y, event = []) {//0空1普通2薄冰3厚冰
		let data = this.getBoardData(x, y);
		switch (data) {
			case 2:
			case 3:
				data--;
				this.setBoardData(x, y, data);
				if (data == 1)this.eliminatedata[5]++;//消除一个冰块
				event.push({x: x, y: y, data: data, edata: 5, type: 'bd'});
				break;
		}
		let sf = this.getSurface(x, y);
		switch (sf) {
			case 2://雪
				this.setSurface(x, y, 1);
				this.setBlock(x, y, -2);
				event.push({x: x, y: y, data: 1, type: 'sf'});
				break;
			case 3://泥块
				this.setSurface(x, y, 1);
				this.eliminatedata[6]++;
				//this.nikuaijishi = 0;
				this.nikuaitime[x][y] = 0;
				event.push({x: x, y: y, data: 1, edata: 6, type: 'sf'});
				break;
			case 4://锁链
				this.setSurface(x, y, 1);
				event.push({x: x, y: y, data: 1, type: "sf"});
				break;
		}
		this.changeSurface(x, y - 1, event);
		this.changeSurface(x, y + 1, event);
		this.changeSurface(x - 1, y, event);
		this.changeSurface(x + 1, y, event);
	}

	//改变格子表面的元素，雪，泥块等
	changeSurface(x, y, event = []) {
		let data = this.getSurface(x, y);
		switch (data) {
			case 2://雪
				this.setSurface(x, y, 1);
				this.setBlock(x, y, -2);//将雪块下面置空，则会多生成一个方块来填补雪块所在位置
				event.push({x: x, y: y, data: 1, type: 'sf'});
				break;
			case 3://泥块
				this.setSurface(x, y, 1);
				this.eliminatedata[6]++;
				//this.nikuaijishi = 0;
				this.nikuaitime[x][y] = 0;
				event.push({x: x, y: y, data: 1, edata: 6, type: 'sf'});
				break;
			case 4://锁链
				this.setSurface(x, y, 1);
				event.push({x: x, y: y, data: 1, type: "sf"});
				break;
		}
	}

	//检查x，y处是否是金豆并进行相应处理
	checkGoldenBean(x, y, tox, toy, remove) {
		if (this.getBlock(x, y) != 6)return;//不是金豆
		if (tox.length) {
			x = tox[tox.length - 1];
			y = toy[toy.length - 1] + 1;
		} else y++;
		if (y == this.rows) {
			tox.push(x);//move
			toy.push(y);
			remove.push({x: x, y: y, type: 6});//remove
			this.goldbeans++;
			this.goldbeanget = parseInt(Math.random() * 4 + 1);
			//console.log("收集到一个金豆");
		}
	}

	//清除生成特效后的其他方块
	clearOtherSquare(x, y) {
		let result = this._checkChainDetailed(x, y);
		//只有一条线上会有3块以上，不可能同时存在两条，对于判定点来说，同时两条3块的可能同时出现
		let row = result.row, col = result.col;
		if (row > 3) {
			for (let i = 1; i < row; i++) {
				this.chaincopy[x + i][y] = 3;
			}
		} else if (col > 3) {
			for (let i = 1; i < col; i++) {
				this.chaincopy[x][y - i] = 3;
			}
		}
	}

	//土块传染扩展，所有方块共用一个计时
	clodInfect(view) {
		if (this.nikuaijishi < 10000 || this.nikuaimanyaning || this.swaping || this.skilltriggering)return;//10s
		this.nikuaimanyaning = true;//泥块蔓延中
		this.surfaceCopy();
		let xx = [-1, 0, 1, 1, 1, 0, -1, -1], yx = [-1, -1, -1, 0, 1, 1, 1, 0], i, j, x, y, event = [], change = [];
		for (i = 0; i < this.cols; i++) {
			for (j = 0; j < this.rows; j++) {
				let k = 0, l = {num: 2};
				x = i + xx[k];
				y = j + yx[k];
				while (this.getSfCopy(i, j) == 3 && this.clodCouldInfect(x, y, l, change)) {
					if (k > 6)break;
					k++;
					x = i + xx[k];
					y = j + yx[k];
				}
			}
		}
		if (!change.length) {
			this.gameOver();
			event.push({type: 'gameover'});
		} else {
			event.push({type: 'change', data: change});
		}
		view.selectable = false;
		view.boardEventsHandler(event);
		this.nikuaijishi = this.nikuaimanyaning = 0;
	}

	//更新泥块的时间，所有方块各自有一个计时，但是在游戏中的表现感觉不出来
	clodInfec(time, view) {
		if (this.nikuaimanyaning || this.swaping || this.skilltriggering)return;
		this.nikuaimanyaning = true;//泥块蔓延中
		this.surfaceCopy();
		let xx = [-1, 0, 1, 1, 1, 0, -1, -1], yx = [-1, -1, -1, 0, 1, 1, 1, 0], i, j, x, y, event = [], change = [], has;
		for (i = 0; i < this.cols; i++) {
			for (j = 0; j < this.rows; j++) {
				if (this.getSfCopy(i, j) != 3)continue;
				this.nikuaitime[i][j] += time;
				if (this.nikuaitime[i][j] < 5000 || isNaN(this.nikuaitime[i][j]))continue;
				has = true;
				let k = 0, l = {num: 2};//蔓延两块
				x = i + xx[k];
				y = j + yx[k];
				while (this.clodCouldInfect(x, y, l, change)) {
					if (k > 6)break;
					k++;
					x = i + xx[k];
					y = j + yx[k];
				}
				this.nikuaitime[i][j] = 0;
			}
		}
		if (has) {
			if (change.length) {//还有能改变的方块
				event.push({type: 'change', data: change});
			} else {//目前蔓延的泥块没有能蔓延的了，判断是否所有方块都不能蔓延了，是的话结束游戏
				let keyimanyan = false;
				for (i = 0; i < this.cols; i++) {
					for (j = 0; j < this.rows; j++) {
						let bl = this.getBlock(i, j), sf = this.getSurface(i, j);
						if (bl >= 0 && bl < 5 && sf == 1) {
							keyimanyan = true;
							break;
						}
					}
					if (keyimanyan)break;
				}
				if (!keyimanyan) {//真的不能蔓延了，结束
					this.gameOver();
					event.push({type: 'gameover'});
				}
			}
			if (event.length) {//有事件才调用
				view.selectable = false;
				view.boardEventsHandler(event);
			}
		}
		this.nikuaimanyaning = false;
	}

	//向指定位置蔓延泥块
	clodCouldInfect(x, y, numob, event) {
		let bd = this.getBoardData(x, y), sf = this.getSurface(x, y), bl = this.getBlock(x, y);
		if (bl < 0 || bl > 4 || sf > 1)return true;//跳过这个方块
		this.setSurface(x, y, 3);
		this.nikuaitime[x][y] = 0;
		if (this.mission.type == "eliminate" && this.mission.data[0].type == 6)  this.mission.data[0].data++;//如果任务是消除泥块
		event.push({x: x, y: y, data: 3, type: 'sf'});
		return (--numob.num);
	}

	//尝试生成特效方块，如不成功则消去方块
	createEffectSquare(x, y, ops) {
		let type = this.getBlock(x, y);
		let change = false;
		let chain = this.chaincopy[x][y];
		if (chain == 5) {//生成猫头鹰
			let p1 = ops.p1, p2 = ops.p2;
			if (p1 && this.getBlock(p1.x, p1.y) < 10 && this.getBlock(p2.x, p2.y) < 10) {
				if ((x == p1.x && y == p1.y) || (x == p2.x && y == p2.y)) {
					this.setBlock(x, y, 5);
					ops.changed.push({x: x, y: y, data: 5, type: 'bl'});
					change = true;
				}
			} else {
				this.setBlock(x, y, 5);
				ops.changed.push({x: x, y: y, data: 5, type: 'bl'});
				change = true;
				this.clearOtherSquare(x, y);
			}
		} else if (chain == 4 || (chain == 3 && this.createESBLJ(x, y))) {//一条线,┓┳
			switch (type) {
				case 0:
					if (this.sk_warrior < 9)this.sk_warrior++;
					break;
				case 1:
					if (this.sk_priest < 9)this.sk_priest++;
					break;
				case 2:
					if (this.sk_rune_keeper < 9)this.sk_rune_keeper++;
					break;
				case 3:
					if (this.sk_robber < 9)this.sk_robber++;
					break;
				case 4:
					if (this.sk_hunter < 9)this.sk_hunter++;
					break;
			}
			//console.log("type获得技能:" + type);
			this.clearOtherSquare(x, y);
			ops.event.push({type: "updateskillnum"});
		}

		if (!change) {//没有生成猫头鹰
			if (type == 13)type = 7;
			this.eliminatedata[type]++;
			ops.removed.push({x: x, y: y, type: type});
			if (this.getColor(this.hero.id) == type && this.energy < this.hero.energy && (++this.energy) == this.hero.energy) {
				this.sk_player = true;
				console.log("sk_player true");
			}
			this.setBlock(x, y, -2);
			let scorech = this.scorechain[x][y];
			if (chain > 2)ops.score.push({score: this.baseScore * Math.pow(2, (scorech - 3)), x: x, y: y, type: type});
			else ops.score.push({score: this.baseScore, x: x, y: y, type: type});
		}

		if (this.inBossSide(x, y)) {
			ops.bossdamage.push(1);
			this.boss.hp -= 1;
		}
	}

	//折线判断是否是折线中心转折点，┳┏,十,createEffectSquareBrokenLineJudge,origin为真时使用真实数据，否则使用复制数据
	createESBLJ(x, y, direction) {
		if (x < 0 || y < 0 || x >= this.cols || y > this.rows)return false;
		let type = this.getCopyBlock(x, y);
		let left, right, up, down, col, row;
		left = right = up = down = col = row = false;
		if (type == this.getCopyBlock(x - 1, y) && this._checkCopyChain(x - 1, y) > 2 && type == this.getCopyBlock(x - 2, y) && this._checkCopyChain(x - 2, y) > 2) left = true;
		if (type == this.getCopyBlock(x, y - 1) && this._checkCopyChain(x, y - 1) > 2 && type == this.getCopyBlock(x, y - 2) && this._checkCopyChain(x, y - 2) > 2) up = true;
		if (type == this.getCopyBlock(x + 1, y) && this._checkCopyChain(x + 1, y) > 2 && type == this.getCopyBlock(x + 2, y) && this._checkCopyChain(x + 2, y) > 2) right = true;
		if (type == this.getCopyBlock(x, y + 1) && this._checkCopyChain(x, y + 1) > 2 && type == this.getCopyBlock(x, y + 2) && this._checkCopyChain(x, y + 2) > 2) down = true;
		if (type == this.getCopyBlock(x - 1, y) && this._checkCopyChain(x - 1, y) > 2 && type == this.getCopyBlock(x + 1, y) && this._checkCopyChain(x + 1, y) > 2) row = true;
		if (type == this.getCopyBlock(x, y - 1) && this._checkCopyChain(x, y - 1) > 2 && type == this.getCopyBlock(x, y + 1) && this._checkCopyChain(x, y + 1) > 2) col = true;
		let result = ((left || right || row) && (up || down || col));
		if (!result && (--direction) > 0) {
			return (this.createESBLJ(x - 1, y, direction) || this.createESBLJ(x + 1, y, direction) || this.createESBLJ(x, y - 1, direction) || this.createESBLJ(x, y + 1, direction));
		}
		return result;
	}

	//创建新方块填补上方空白
	createNewSquare(moved, goldbeanremove) {
		for (let x = 0; x < this.cols; x++) {
			let toy = -1;
			while (this.getBlock(x, 0) < -1 && !this.isBarrier(x, 0)) {
				if (this.goldbeanget == 1) {//刷新一个新的金豆荚
					this.goldbeanget = 0;
					this.setBlock(x, 0, 6);
				} else if (this.zhulouluotime == 0) {//刷新一个猪喽啰
					this.zhulouluotime = parseInt(Math.random() * 4 + 2);
					this.setBlock(x, 0, 13);
				} else this.setBlock(x, 0, randomBlock.call(this));
				let toX = [x], toY = [0], type = this.getBlock(x, 0);
				this.fillBlank(x, 0, toX, toY);
				let fx = finalObject(toX), fy = finalObject(toY);
				if (this.getBoardData(fx, fy) == 5) {
					this.setBlock(x, 0, -2);
					break;
				}
				this.checkGoldenBean(x, 0, toX, toY, goldbeanremove);
				this.pathOptimizeMove(x, toX, toY);
				moved.push({toX: toX, toY: toY, fromX: x, fromY: toy, type: type});
				if (fx != x || fy != 0 || fy == this.rows) {
					this.setBlock(x, 0, -2);
					if (fy < this.rows) this.setBlock(fx, fy, type);
				}
				toy--;
				//this.print();
			}
		}
	}

	//移动一格填补空白
	fillBlank(x, y, tox, toy) {
		if (y + 1 >= this.rows)return;
		if (this.getBlock(x, y + 1) < -1 && !this.isBarrier(x, y + 1)) {//下方有空白
			tox.push(x);
			toy.push(y + 1);
			this.fillBlank(x, y + 1, tox, toy);
		} else if (this.hasBarrier(x - 1, y + 1) && !(this.isBarrier(x, y + 1) && this.isBarrier(x - 1, y))) {//左下空白
			tox.push(x - 1);
			toy.push(y + 1);
			this.fillBlank(x - 1, y + 1, tox, toy);
		} else if (this.hasBarrier(x + 1, y + 1) && !(this.isBarrier(x, y + 1) && this.isBarrier(x + 1, y))) {//右下空白
			tox.push(x + 1);
			toy.push(y + 1);
			this.fillBlank(x + 1, y + 1, tox, toy);
		}
	}

	gameOver() {
		this.gameover = true;
		this.gameing = false;
	}

	//游戏结束判断
	gameOverJudge(overtime, view) {
		if (!this.gameing)return;//游戏已结束
		this.usetime += overtime;//毫秒
		this.remainingtime = this.time * 1000 - this.usetime;
		if (this.time && this.remainingtime < 0) {//有时间限制才算
			this.gameOver();
			return true;
		}
		if (this.nikuaijishi) {
			this.clodInfec(overtime, view);
		}
		this.bossSkillLaunch(overtime, view);
	}

	getBlock(x, y) {
		//console.log(x + ",357--" + y);
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1)  return -1;
		return this.blocks[x][y];
	}

	//针对主角，匹配颜色
	getColor(x, y) {
		let color;
		if (y == null)  color = x;
		else color = this.getBlock(x, y);
		switch (color) {
			case 7:
				return 0;//银色
			case 8:
				return 1;//绿色
			case 9:
			case 12:
				return 2;//紫色
			case 10:
				return 3;//黑色
			case 11:
				return 4;//黄色
		}
		return color;
	}

	getCopyBlock(x, y) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1)  return -1;
		return this.blockscopy[x][y];
	}

	//复制一份blocks信息
	getBoard() {
		let copy = [];
		for (let x = 0; x < this.cols; x++)
			copy[x] = this.blocks[x].slice(0);
		return copy;
	}

	getBoardData(x, y) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1)  return -1;
		return this.boarddata[y][x];
	}

	getBdCopy(x, y) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1)  return -1;
		return this.bdcopy[y][x];
	}

	getSurface(x, y) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1)  return -1;
		return this.surface[y][x];
	}

	getSfCopy(x, y) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1)  return -1;
		return this.sfcopy[y][x];
	}

	//查询某位置的上方是否有障碍物，且到障碍物之间没有一个方块
	hasBarrier(x, y) {
		if (this.getBlock(x, y) > -2 || this.isBarrier(x, y) || y < 1 || y >= this.rows)return;
		for (let i = y - 1; i >= 0; i--) {
			if (this.getBlock(x, i) >= 0)return this.isBarrier(x, i);//有障碍物返真，无则返假
			if (this.isBarrier(x, i))return true;//有障碍物
		}
	}

	//任务完成
	hasClearMission(event = [], clear) {
		let mission = this.mission;
		if (!mission)return;
		let data = mission.data;
		switch (mission.type) {
			case "score":
				if (this.score >= data)clear = true;
				break;
			case "eliminate":
				for (let i = 0; i < data.length; i++) {
					let type = data[i].type;
					if (this.eliminatedata[type] < data[i].data)break;
					if (i == data.length - 1)clear = true;
				}
				break;
			case "cellect":
				if (this.goldbeans >= data)clear = true;
				break;
			case "boss":
				if (this.boss.hp < 1)clear = true;
				break;
			case "rescue":
				for (let i = 0; i < data.length; i++) {
					let o = data[i];
					if (this.isBegirt(o.x, o.y))break;//还有被包围的
					this.rescuecunminshu = i + 1;//营救村民数
					if (i + 1 == data.length)clear = true;
				}
				break;
		}
		if (clear) {
			this.gameclear = true;
			this.gameing = false;
			let bl;
			if (this.stepsorigin) {//有步数限制
				bl = this.stepslimit / this.stepsorigin;
			} else if (this.time) {//时间限制
				bl = (this.time - this.usetime / 1000 ) / this.time;
			}
			console.log("得分比例:" + bl);
			if (bl > 0.5)this.star = 3;
			else if (bl > 0.25)this.star = 2;
			else this.star = 1;
			console.log("过关星级：" + this.star);
			this.gameOver();
			event.push({type: 'clear'});
		}
	}

	//在boss的位置上
	inBossSite(x, y) {
		if (!this.boss)return false;
		return (x >= this.boss.x && x <= this.boss.x2 && y >= this.boss.y && y <= this.boss.y2);
	}

	//在boss旁边或在boss上
	inBossSide(x, y) {
		if (!this.boss)return;
		return (x >= this.boss.x - 1 && x <= this.boss.x2 + 1 && y >= this.boss.y - 1 && y <= this.boss.y2 + 1);
	}

	/*
	 第一层数据设置，在普通消除元素下面一层，无法移动，没有负值，
	 0空1普通2薄冰（可消）3厚冰（可消）4门5方块传送门（方块可以穿过，但不会停留）
	 */
	initBoardData(ops) {
		if (ops.boarddata) this.boarddata = ops.boarddata;
		else {
			this.boarddata = [];
			for (let i = 0; i < this.rows; i++) {
				this.boarddata[i] = [];
				for (let j = 0; j < this.cols; j++)
					this.boarddata[i][j] = 1;
			}
		}
	}

	/*
	 mission格式：
	 1.1000分过关{type:'score',data:1000}
	 2.消除10个第2类方块{type:'eliminate',data:[{type:1,data:10}]}，data中放消除的类型和数量组成的对象，可以放多个,0-4职业方块5薄冰6泥块7小猪喽啰
	 3.收集3个金豆荚{type:'cellect',data:3}
	 4.逃出{type:'escape',data:{x:4,y:8}}
	 5.boss战{type: 'boss', data: {hp: 50, x: 7, y: 4, x2: 2, y2: 2}}
	 6.营救{type:'rescue',data:[{x:1,y:1}]},data中放营救人物的坐标，可以是多个
	 */
	initMission(mission) {
		if (!mission)return;
		this.mission = mission;
		this.setBoss(mission);
		this.goldbeans = 0;//收集到的金豆数
		this.goldbeanget = 0;//收集金豆间隔计数器
		this.rescuecunminshu = 0;
		let data = mission.data;
		if (mission.type == 'escape')this.setBoardData(data.x, data.y, 4);
		else if (mission.type == 'eliminate') {
			for (let i = 0; i < data.length; i++) {
				let type = data[i].type;
				if (type == 6) {//泥块
					//this.nikuaijishi = 0;
					this.nikuaijishi = true;
					this.nikuaitime = [];
					for (let j = 0; j < this.cols; j++) {
						this.nikuaitime[j] = [];
						for (let k = 0; k < this.rows; k++) {
							this.nikuaitime[j][k] = 0;
						}
					}
				} else if (type == 7) {//猪喽啰
					this.zhulouluo = true;
				}
			}
		}
	}

	/*
	 第三层数据设置，在普通消除元素上层，没有负值，可以消除，不能移动，不能被主动技能选取（除非下面有普通方块），注意如果下方没有普通职业方块（即该方块是障碍物）的需要在相应函数中配置
	 1普通2雪3泥块（下面的方块无法移动，消除以它为中心的9块都可以消除泥块）4锁链（类似泥块，但是不会蔓延）5村民
	 */
	initSurface(ops) {
		if (ops.surface) this.surface = ops.surface;
		else {
			this.surface = [];
			for (let i = 0; i < this.rows; i++) {
				this.surface[i] = [];
				for (let j = 0; j < this.cols; j++)
					this.surface[i][j] = 1;
			}
		}
	}

	//是障碍物或是不能通过的传送门（传送门下方有方块）
	isBarrier(x, y) {
		let bd = this.getBoardData(x, y), sf = this.getSurface(x, y), bl = this.getBlock(x, y + 1);
		return (bd < 1 || sf > 1 || (bd == 5 && bl != -2));
	}

	//是可消除元素
	isEliminatable(x, y) {
		let type = this.getBlock(x, y);
		//基础职业、雪、泥块、猪喽啰
		return ((type > -1 && type < this.numBlockTypes) || this.getSurface(x, y) > 1 || type == 13);
	}

	//根据type查是否是英雄
	isHero(type) {
		if (type > 6 && type < 13)return 1;
	}

	//是否被锁链包围
	isBegirt(x, y) {
		if (this.getSurface(x - 1, y) == 4)return true;
		if (this.getSurface(x - 1, y - 1) == 4)return true;
		if (this.getSurface(x, y - 1) == 4)return true;
		if (this.getSurface(x + 1, y - 1) == 4)return true;
		if (this.getSurface(x + 1, y) == 4)return true;
		if (this.getSurface(x + 1, y + 1) == 4)return true;
		if (this.getSurface(x, y + 1) == 4)return true;
		if (this.getSurface(x - 1, y + 1) == 4)return true;
	}

	//移动一个悬空方块
	moveGapSquare(x, y, moved, goldbeanremove, tox = [], toy = []) {
		let bd = this.getBoardData(x, y), type = this.getBlock(x, y), sf = this.getSurface(x, y);
		if (type < 0 || bd < 1 || sf > 1)return;
		this.fillBlank(x, y, tox, toy);
		this.checkGoldenBean(x, y, tox, toy, goldbeanremove);
		if (tox.length) {
			this.pathOptimizeMove(x, tox, toy);
			moved.push({toX: tox, toY: toy, fromX: x, fromY: y, type: type});
			let fx = finalObject(tox), fy = finalObject(toy);
			if (fy < this.rows) this.setBlock(fx, fy, type);
			this.setBlock(x, y, -2);
			//this.print();
		}
	}

	//移动悬空方块,全部移动
	moveGapSquareAll(moved, goldbeanremove) {
		for (let y = this.rows - 1; y >= 0; y--) {//逐行，从下往上
			for (let x = 0; x < this.cols; x++) {//从左往右
				this.moveGapSquare(x, y, moved, goldbeanremove);
			}
		}
	}

	//优化move路径
	pathOptimizeMove(fx, x, y) {
		if (!(x instanceof Array) || x.length < 2)return;
		let pattern;
		if (fx == x[0])pattern = '|';
		else if (fx > x[0])pattern = '/';
		else pattern = "\\";
		fx = x[0];
		for (let i = 1; i < x.length;) {
			if (x[i] == fx) {
				if (pattern == '|') {
					x.splice(i - 1, 1);
					y.splice(i - 1, 1);
				} else  pattern = '|';
			} else if (x[i] < fx) {
				if (pattern == '/') {
					x.splice(i - 1, 1);
					y.splice(i - 1, 1);
				} else pattern = '/';
			} else if (pattern == '\\') {
				x.splice(i - 1, 1);
				y.splice(i - 1, 1);
			} else pattern = '\\';
			fx = x[i];
		}
	}

	//打印整个游戏表格上面的元素信息
	print() {
		let str = '';
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++)
				if (this.getBlock(x, y) >= 0) {
					if (this.getBlock(x, y) < 10) str += '·' + this.getBlock(x, y) + ' ';
					else  str += this.getBlock(x, y) + ' ';
				}
				else  str += this.getBlock(x, y) + ' ';
			str += '\n';
		}
		console.log(str);
	}

	setBlock(x, y, value) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1) throw new Error(`out of range of blocks;x:${x},y:${y}`);
		else this.blocks[x][y] = value;
	}

	setBoardData(x, y, value) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1) throw new Error('out of range of blocks');
		else this.boarddata[y][x] = value;
	}

	setBoss(mission) {
		if (mission.type == 'boss') {
			this.boss = mission.data;
			this.bosstype = this.boss.type;
			this.bossjishi = 0;//boss技能是计时发动的
			this.boss.w = this.boss.x2 - this.boss.x;
			this.boss.h = this.boss.y2 - this.boss.y;
			if (this.bosstype == 1) {//泥浆史莱姆
				this.nikuaijishi = true;
				this.nikuaitime = [];
				for (let i = 0; i < this.cols; i++)this.nikuaitime[i] = [];
			}
		}
	}

	setSurface(x, y, value) {
		if (x < 0 || x > this.cols - 1 || y < 0 || y > this.rows - 1) throw new Error('out of range of blocks');
		else this.surface[y][x] = value;
	}

	//技能发动
	skillTrigger(type, arg, callback) {
		this.skilltriggering = true;//技能发动中
		let event = [];
		let changed = [], score = [], removed = [], moved = [], goldbeanremove = [], bossdamage = [];
		let ops = {event: event, removed: removed, changed: changed, bossdamage: bossdamage, score: score};
		this.chaincopy = this._getChains();
		this.scorechain = this._getChains();
		switch (type) {
			case 1:
				this.skillWarrior(arg, ops);
				break;
			case 3:
				this.skillRuneKeeper(arg, ops);
				break;
			case 4:
				this.skillRobber(arg, ops);
				break;
			case 5:
				this.skillHunter(arg, ops);
				break;
			case 7:
				arg.view.skilllaunchnum++;
				this.skillMobaoshi(arg, event);
				break;
			case 9:
				this.skillModaoshi(arg, ops);
				break;
			case 10:
				this.skillRobber(arg, ops, 1);
				break;
			case 11:
				this.skillNupaoshou(arg, ops);
				break;
			case 12:
				this.skillFuwenYinjieShaonv(arg, ops);
				break;
		}
		for (let i = 0; i < score.length; i++)this.score += score[i].score;
		this.moveGapSquareAll(moved, goldbeanremove);
		this.createNewSquare(moved, goldbeanremove);
		event.push({type: 'updateskillnum'},
			{type: 'remove', data: removed},
			{type: 'change', data: changed},
			{type: 'bossdamage', data: bossdamage},
			{type: 'score', data: score},
			{type: 'move', data: moved},
			{type: 'goldbeanremove', data: goldbeanremove});
		this._check(event);
		this.skilltriggering = false;
		callback(event);
	}

	//战士技能,九格爆炸一次
	skillWarrior(p, ops) {
		this.sk_warrior--;
		let x = p.x, y = p.y;
		this.triggerEffectSquare(x - 1, y - 1, ops);
		this.triggerEffectSquare(x - 1, y, ops);
		this.triggerEffectSquare(x - 1, y + 1, ops);
		this.triggerEffectSquare(x, y + 1, ops);
		this.triggerEffectSquare(x, y, ops);
		this.triggerEffectSquare(x, y - 1, ops);
		this.triggerEffectSquare(x + 1, y - 1, ops);
		this.triggerEffectSquare(x + 1, y, ops);
		this.triggerEffectSquare(x + 1, y + 1, ops);
		if (this.skillWarriorDamageBoss(x, y)) {
			this.boss.hp -= 5;
			ops.bossdamage.push(5);
		}
	}

	//战士技能打到boss,战士技能函数调用
	skillWarriorDamageBoss(x, y) {
		return (this.inBossSite(x - 1, y - 1) || this.inBossSite(x - 1, y) || this.inBossSite(x - 1, y + 1) || this.inBossSite(x, y - 1) || this.inBossSite(x, y) || this.inBossSite(x, y + 1) || this.inBossSite(x + 1, y - 1) || this.inBossSite(x + 1, y) || this.inBossSite(x + 1, y + 1));
	}

	//牧师技能，回时间或步数
	skillPriest() {
		this.sk_priest--;
		if (this.stepslimit < 98)this.stepslimit += 2;//加2步
		else if (this.stepslimit < 99) {
			this.stepslimit++;
			this.time += 5;
		} else if (this.time)this.time += 10;//加10秒
		else if (this.sk_hunter < 99 || this.sk_robber < 99 || this.sk_rune_keeper < 99 || this.sk_warrior < 99) {//增加一个其他技能
			let add = false;
			do switch (parseInt(Math.random() * 4)) {
				case 0:
					if (this.sk_warrior < 99) {
						this.sk_warrior++;
						add = true;
					}
					break;
				case 1:
					if (this.sk_rune_keeper < 99) {
						this.sk_rune_keeper++;
						add = true;
					}
					break;
				case 2:
					if (this.sk_robber < 99) {
						this.sk_robber++;
						add = true;
					}
					break;
				case 3:
					if (this.sk_hunter < 99) {
						this.sk_hunter++;
						add = true;
					}
					break;
			} while (!add);
		}
	}

	//符文师技能，交换两个方块，主角只能移动一格
	skillRuneKeeper(arg, ops) {
		let x1 = arg.p.x, y1 = arg.p.y, x2 = arg.p2.x, y2 = arg.p2.y;
		let type1 = this.getBlock(x1, y1), type2 = this.getBlock(x2, y2);
		if ((this.isHero(type1) || this.isHero(type2)) && !isAdjacent(x1, y1, x2, y2))return;//主角只能移动一格
		this.sk_rune_keeper--;
		this.setBlock(x1, y1, type2);
		this.setBlock(x2, y2, type1);
		ops.event.push({type: 'swap', data: {x1: x1, y1: y1, x2: x2, y2: y2}});
	}

	//盗贼技能，偷取一个方块,yx为真时是偷盗大师的技能,偷盗大师，高级偷取，可以偷走雪块，泥块
	skillRobber(arg, ops, yx) {
		if (!yx)this.sk_robber--;//职业盗贼技能
		let x = arg.x, y = arg.y;
		let type = this.getBlock(x, y);
		if (type < 0)return;
		if (type < this.numBlockTypes) {//普通方块
			this.eliminatedata[type]++;
		} else if (type == 6) {//金豆荚
			this.goldbeans++;
			this.goldbeanget = parseInt(Math.random() * 4 + 1);
		} else if (type == 13) {//猪喽啰
			this.eliminatedata[7]++;
		}
		ops.removed.push({x: x, y: y, type: type});
		this.setBlock(x, y, -2);
		if (yx)this.changeBoardData(x, y, ops.changed);
	}

	//猎人技能，消除一行或一列
	skillHunter(arg, ops) {
		let x1 = arg.p.x, y1 = arg.p.y, x2 = arg.p2.x, y2 = arg.p2.y;
		if (x1 != x2 && y1 != y2)return;//不是一行或一列
		this.sk_hunter--;
		if (x1 == x2) {//一列
			for (let i = 0; i < this.rows; i++) {
				this.triggerEffectSquare(x1, i, ops);
			}
			//打到boss
			if (this.boss && x1 >= this.boss.x && x1 <= this.boss.x2) {
				this.boss.hp -= 5;
				ops.bossdamage.push(5);
			}
		} else {//一行
			for (let i = 0; i < this.rows; i++) {
				this.triggerEffectSquare(i, y1, ops);
			}
			//打到boss
			if (this.boss && y1 >= this.boss.y && y1 <= this.boss.y2) {
				this.boss.hp -= 5;
				ops.bossdamage.push(5);
			}
		}
	}

	//魔爆师，九格连爆数次
	skillMobaoshi(p, event) {
		let x = p.x, y = p.y, view = p.view;
		let changed = [], score = [], removed = [], moved = [], goldbeanremove = [], bossdamage = [];
		let ops = {event: event, removed: removed, changed: changed, bossdamage: bossdamage, score: score};
		this.triggerEffectSquare(x - 1, y - 1, ops);
		this.triggerEffectSquare(x - 1, y, ops);
		this.triggerEffectSquare(x - 1, y + 1, ops);
		this.triggerEffectSquare(x, y + 1, ops);
		this.triggerEffectSquare(x, y, ops);
		this.triggerEffectSquare(x, y - 1, ops);
		this.triggerEffectSquare(x + 1, y - 1, ops);
		this.triggerEffectSquare(x + 1, y, ops);
		this.triggerEffectSquare(x + 1, y + 1, ops);
		if (this.skillWarriorDamageBoss(x, y)) {
			this.boss.hp -= 5;
			bossdamage.push(5);
		}
		for (let i = 0; i < score.length; i++)this.score += score[i].score;
		this.moveGapSquareAll(moved, goldbeanremove);
		this.createNewSquare(moved, goldbeanremove);
		event.push({type: 'updateskillnum', data: --view.skilllaunchnum},
			{type: 'remove', data: removed},
			{type: 'change', data: changed},
			{type: 'bossdamage', data: bossdamage},
			{type: 'score', data: score},
			{type: 'move', data: moved},
			{type: 'goldbeanremove', data: goldbeanremove});
		if (view.skilllaunchnum)this.skillMobaoshi(p, event);
	}

	//魔导师，数条连线消除（加强型的猎人技能）：十型，卄型，#型
	skillModaoshi(array, ops) {
		let p, x, y;
		for (let i = 0; i < array.length; i++) {
			p = array[i];
			x = p.x;
			if (x >= 0) {
				for (let j = 0; j < this.rows; j++)this.triggerEffectSquare(x, j, ops);
				continue;
			}
			y = p.y;
			if (y >= 0) for (let j = 0; j < this.cols; j++)this.triggerEffectSquare(j, y, ops);
		}
	}

	//弩炮手，超指定位置开枪数次，每次发射3颗子弹
	skillNupaoshou(ps, ops) {
		for (let i = 0; i < ps.length && i < 3; i++) {
			let x = ps[i].x, y = ps[i].y;
			if (this.isEliminatable(x, y)) {
				this.changeBoardData(x, y, ops.changed);
				this.createEffectSquare(x, y, ops);
			}
		}
	}

	//符文音阶少女，方块自动移动配对消除
	skillFuwenYinjieShaonv(view, ops) {
		if (view.skilllaunchnum == 'oo') {
			while (this._hasMoves(3)) {
				let p1 = this._hasMoves(3);
				let x1 = p1.x, y1 = p1.y;
				let p2 = p1.p2;
				let x2 = p2.x, y2 = p2.y;
				let tmp = this.getBlock(x1, y1), t2 = this.getBlock(x2, y2);
				this.setBlock(x1, y1, t2);
				this.setBlock(x2, y2, tmp);
				ops.event.push({type: 'swap', data: {x1: x1, y1: y1, x2: x2, y2: y2}});
				ops.event.push({type: 'updateskillnum', data: 'oo'});
			}
			view.skilllaunchnum = 0;
		} else {
			for (let i = 0; i < view.skilllaunchnum;) {
				let p1 = this._hasMoves(3);
				if (!p1) return view.skilllaunchnum = 0;
				let x1 = p1.x, y1 = p1.y;
				let p2 = p1.p2;
				let x2 = p2.x, y2 = p2.y;
				let tmp = this.getBlock(x1, y1), t2 = this.getBlock(x2, y2);
				this.setBlock(x1, y1, t2);
				this.setBlock(x2, y2, tmp);
				ops.event.push({type: 'swap', data: {x1: x1, y1: y1, x2: x2, y2: y2}});
				ops.event.push({type: 'updateskillnum', data: --view.skilllaunchnum});
			}
		}
	}

	surfaceCopy() {
		this.sfcopy = [];
		for (let i = 0; i < this.rows; i++)this.sfcopy[i] = this.surface[i].concat();
	}

	//交换
	swap(x1, y1, x2, y2, callback) {
		this.swaping = true;//交换方块中
		let tmp, events = [], sf1 = this.getSurface(x1, y1), sf2 = this.getSurface(x2, y2);
		if (sf1 > 1 || sf2 > 1) {//封在障碍物中的方块不能交换
			this.swaping = false;
			return callback(events);
		}
		tmp = this.getBlock(x1, y1);
		this.setBlock(x1, y1, this.getBlock(x2, y2));
		this.setBlock(x2, y2, tmp);
		events.push({type: 'swap', data: {x1: x1, y1: y1, x2: x2, y2: y2}});
		this._check(events, {x: x1, y: y1}, {x: x2, y: y2});
		//消除及结束判定
		let removed = false;
		for (let i = 0; i < events.length; i++)
			if (events[i].type == 'remove') {
				removed = true;
				this.stepslimit -= 1;
				if (this.stepslimit < 1) {
					this.gameOver();
					events.push({type: 'gameover'});
				}
				break;
			}
		if (!removed) {
			tmp = this.getBlock(x1, y1);
			this.setBlock(x1, y1, this.getBlock(x2, y2));
			this.setBlock(x2, y2, tmp);
			events.push({type: 'swap', data: {x1: x1, y1: y1, x2: x2, y2: y2}});
		}
		this.swaping = false;
		callback(events);
	}

	//试图触发方块的特效,并消除普通方块
	triggerEffectSquare(x, y, ops) {
		if (!this.isEliminatable(x, y))return;
		this.changeBoardData(x, y, ops.changed);
		this.createEffectSquare(x, y, ops);
	}

	//判断猪喽啰是否已经降到底部，如果是则游戏结束
	zhulouluoDibuPanding() {
		for (let i = 0; i < this.cols; i++) {
			if (this.getBlock(i, this.rows - 1) == 13) {
				this.gameOver();
			}
		}
	}

}

//是否相邻
export function isAdjacent(x1, y1, x2, y2) {
	let dx = Math.abs(x1 - x2), dy = Math.abs(y1 - y2);
	return (dx + dy === 1);
}

//随机生成一个基础职业方块
function randomBlock() {
	return Math.floor(Math.random() * this.numBlockTypes);
}

function finalObject(array) {
	if (!(array instanceof Array) || !array.length)return null;
	return array[array.length - 1];
}