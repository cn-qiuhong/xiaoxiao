import {makeCanvas, text, stage, sprite, draggableSprites, buttons, render,doMyAction} from './max/display.js';
import {assets} from './max/utilities';
import {keyboard, makePointer} from './max/interactive.js';
import {tweens} from "./max/tween.js";
import Board from './board.js';
import {View,pause} from './view.js';
import {Index} from './index.js';
import {newPause} from './pause.js';
import {BOARDDATA} from "./information";
import {ReadyView} from "./readyview.js";

export default function main() {
	assets.load([
		'images/fk0.png', 'images/fk1.png', 'images/fk2.png', 'images/fk3.png', 'images/fk4.png', 'images/fk5.png', 'images/fk6.png', 'images/fk7.png', 'images/fk8.png', 'images/fk9.png', 'images/fk10.png', 'images/fk11.png', 'images/fk12.png', 'images/fk13.png',//主角方块及基础方块
		"images/skill.png",//技能图标
		'images/fk_ice1.png', 'images/fk_ice2.png', 'images/fk_ice3.png', 'images/fk_door.png', "images/fk_ice.png", "images/fk_suolian.png", "images/fk_nikuai.png", "images/fk_cunmin.png",//其他特殊方块
		'images/frame.png', "images/grid.png", "images/bggezi.png", //方块用底等
		'images/xuanguan_bg1.png', "images/xuanguan_bg1bu.png",//选关背景
		"images/bg1_1.png", "images/bg1_2.png", "images/bg1_3.png", "images/bg1_4.png",//关卡内背景
		"images/main_touxiangdiban.png", "images/main_jinengdiban.png", "images/main_touxiangframe.png", "images/main_jinengkuang.png", "images/main_baoshihuang.png", "images/main_dengji.png", "images/main_renwu.png", "images/main_wenhao.png", "images/main_beibao.png", "images/main_shangcheng.png", "images/main_tujian.png", "images/main_return.png", "images/main_index.png",//主界面图标
		"images/herotujian_di.png", "images/hero_hecheng.png", "images/hero_chouqu.png", "images/hero_levelup.png",//英雄图鉴相关图标
		"images/beibao_use.png", "images/beibao_prop.png", "images/beibao_compound.png", "images/beibao_debris.png", "images/beibao_equip.png", "images/beibao_all.png",//背包用
		"images/shop_sell.png", "images/shop_raffle.png", "images/shop_add.png", "images/shop_minus.png", "images/shop_numframe.png", "images/shop_chouqu1.png", "images/shop_chouqu10.png", "images/shop_goumai.png",//商城用
		'images/0.png', 'images/1.png', 'images/2.png', 'images/3.png', 'images/4.png', 'images/5.png', 'images/6.png', 'images/7.png', 'images/8.png', 'images/9.png',//数字
		"images/background.png", 'images/pause.png', 'images/trans.png', "images/jixuyouxi.png", "images/jieshuchuangguan.png", "images/option.png", "images/wenhao.png", "images/guanqia.png", "images/boss_live.png", "images/boss_tongguan.png", "images/fanye_prev.png", "images/fanye_next.png", "images/gameover.png", "images/gameover_fanhui.png", "images/gameover_zaici.png", "images/gameclear.png", "images/gameclear_xiaguan.png", "images/star1.png", "images/star2.png", "images/guoguan1x.png", "images/guoguan2x.png", "images/guoguan3x.png"//其他图标
	]).then(setup);
}

export let screen_height = window.innerHeight;
export let screen_width = screen_height * 0.5625;
if (isMObile())screen_width = window.innerWidth;
let canvasw = 540, canvash = 960;
let BILI_w = screen_width / canvasw, BILI_h = screen_height / canvash;//实际尺寸是预想尺寸的多少倍
export let canvas = makeCanvas({
	width: screen_width, height: screen_height, rw: BILI_w, rh: BILI_h
});
//scale=0.75
//stage.width = canvas.width;
//stage.height = canvas.height;
let pointer = makePointer(canvas), board, game = {}, _elapsetime, _previoustime, pause_g;
//view用元素图片
export let boardAssets = ['images/fk0.png', 'images/fk1.png', 'images/fk2.png', 'images/fk3.png', 'images/fk4.png', 'images/fk5.png', 'images/fk6.png', 'images/fk7.png', 'images/fk8.png', 'images/fk9.png', 'images/fk10.png', 'images/fk11.png', 'images/fk12.png', 'images/fk13.png'];
export let bossAssets = ['images/boss_live.png', "images/boss_live.png"];
export let view;

//资源加载后调用该函数
export function setup() {
	//gameReset();
	//new ReadyView();
	//gameStart(gameLoop);
	gotoIndex();
}

//显示选关界面（初始界面）
export function gotoIndex() {
	pause_g = null;
	gameReset();
	new Index();
	gameStart(gameLoop);
}

//游戏刷新绘制循环
function gameLoop(timestamp) {
	game.loop = requestAnimationFrame(gameLoop);
	if (game.isrunning) {
		_elapsetime = timestamp - _previoustime;

		//canvas.style.cursor = 'auto';
		for (let i = 0; i < buttons.length; i++) {
			let bt = buttons[i];
			bt.update(pointer);
			//if (bt.state === 'over' || bt.state === 'down') {
			//	if (bt.parent)canvas.style.cursor = 'pointer';
			//}
		}
		//console.log(pointer);

		doMyAction(stage.children);

		if (tweens.length > 0)
			for (let i = tweens.length - 1; i >= 0; i--) {
				let tween = tweens[i];
				if (tween) tween.update();
			}

		if (board && !board.gameclear && !board.gameover && view && !view.gameclear && !view.gameover && board.gameOverJudge(_elapsetime, view))view.gameOver();
		//长时间没有移动成功时给予提示
		if (view && _elapsetime)  view.movepasttime += _elapsetime;
		if (view && view.movepasttime > 10000)   view.hintEliminate(board);
	} else {
		pause.update(pointer, canvas);
		if (pause_g)pause_g.update(pointer, canvas);
	}
	render(canvas);
	_previoustime = timestamp;
}

//点击暂停
export function gamePause() {
	game.isrunning = !game.isrunning;
	if (!pause_g)pause_g = newPause();
	pause_g.showOrHide();
}

//清空所有元素
function gameReset() {
	if (game != null)gameStop();
	stage.removeAll();
}

//选关，选英雄后进入游戏
export function gameSetup(level, hero) {
	gameReset();
	if (level > BOARDDATA.length) {
		console.log("关卡超过上限，出错！" + level);
		gotoIndex();
		return;
	}
	let boarddata = objectClone(BOARDDATA[level - 1]);
	if (hero) boarddata.hero = hero;
	board = new Board(boarddata);
	board.print();
	view = new View(board);
	view.resetBlocks();
	gameStart(gameLoop);
}

//开始刷新绘制
function gameStart(loop) {
	_previoustime = 0;
	game.isrunning = true;
	game.loop = requestAnimationFrame(loop);
}

//停止刷新绘制
function gameStop() {
	game.isrunning = false;
	if (game.loop) cancelAnimationFrame(game.loop);
}

//判断是否是移动端
function isMObile() {
	var browser = navigator.userAgent.toLowerCase();
	return (browser.indexOf('android') >= 0 || browser.indexOf('iphone') >= 0 || browser.indexOf('ipad') >= 0 || browser.indexOf('mobile') >= 0 || browser.indexOf("phone") >= 0);
}

//深拷贝，对象或数组
function objectClone(o) {
	let c;
	if (o instanceof Array)c = [];
	else if (o instanceof Object)c = {};
	for (let key in o) {
		if (o[key] instanceof Object)c[key] = objectClone(o[key]);//对象或数组
		else c[key] = o[key];
	}
	return c;
}
