/*
 信息资料
 */

//背景数据
let boarddata2 = [
	[1, 5, 5, 5, 5, 5, 5, 1], [1, 1, 5, 5, 5, 5, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0]
];
let boarddata4 = [
	[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 2, 1, 1, 1], [1, 1, 1, 1, 1, 1, 2, 2], [1, 1, 1, 2, 2, 1, 1, 1], [1, 1, 2, 2, 2, 1, 1, 1], [1, 1, 1, 1, 1, 2, 1, 2], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]
];
let boarddata5 = [
	[5, 1, 5, 5, 5, 5, 1, 5], [5, 1, 1, 5, 5, 1, 1, 5], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 5, 1, 1, 5, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [0, 1, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1, 0, 0]
];
//表面数据
let surface3 = [
	[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 3, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 3, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [3, 1, 1, 1, 1, 1, 1, 3]
];
let surface4 = [
	[1, 1, 1, 2, 1, 1, 1, 1], [1, 1, 1, 1, 2, 1, 1, 1], [1, 1, 1, 1, 1, 2, 1, 1], [2, 1, 2, 1, 1, 1, 1, 1], [1, 1, 1, 2, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]
];
let surface9 = [
	[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [4, 4, 4, 1, 1, 4, 4, 4], [4, 5, 4, 1, 1, 4, 5, 4], [4, 4, 4, 1, 1, 4, 4, 4], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]
];

//关卡信息，任务，限制，位置,表格情况
export let BOARDDATA = [
	{stepslimit: 10, mission: {type: 'score', data: 50000}, level: 1, x: 200, y: 225},
	{stepslimit: 12, mission: {type: 'eliminate', data: [{type: 0, data: 20}, {type: 2, data: 20}]}, level: 2, boarddata: boarddata2, x: 125, y: 125},
	{time: 60, mission: {type: 'eliminate', data: [{type: 6, data: 4}]}, level: 3, x: 140, y: 5, surface: surface3},
	{time: 60, mission: {type: 'eliminate', data: [{type: 5, data: 10}]}, level: 4, boarddata: boarddata4, surface: surface4, x: 240, y: -80},
	{stepslimit: 15, boarddata: boarddata5, mission: {type: 'boss', data: {hp: 50, type: 0, x: 3, y: 5, x2: 4, y2: 5}}, level: 5, x: 360, y: -145},
	{mission: {type: 'escape', data: {x: 4, y: 6}}, level: 6, x: 430, y: -255},
	{time: 120, mission: {type: "eliminate", data: [{type: 7, data: 3}]}, level: 7, x: 410, y: -390},
	{mission: {type: 'cellect', data: 3}, stepslimit: 20, level: 8, x: 310, y: -490},
	{mission: {type: 'rescue', data: [{x: 1, y: 4}, {x: 6, y: 4}]}, time: 180, level: 9, x: 260, y: -620, surface: surface9},
	{mission: {type: "boss", data: {hp: 50, type: 1, x: 3, y: 3, x2: 4, y2: 4}}, level: 10, x: 350, y: -750}
];