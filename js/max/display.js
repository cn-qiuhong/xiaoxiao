export let draggableSprites = [];
export let buttons = [];

export class DisplayObject {
	constructor() {
		this.x = 0;
		this.y = 0;
		this._x = 0;
		this._y = 0;
		this._width = 0;
		this._height = 0;

		this.rotation = 0;//旋转
		this.alpha = 1;
		this.visible = true;
		this.scaleX = 1;//水平翻转
		this.scaleY = 1;//垂直翻转

		this._anchorX = 0.5;//中心点，锚点
		this._anchorY = 0.5;

		this._offsetX = this.width * this._anchorX;//半径
		this._offsetY = this.height * this._anchorY;

		this.vx = 0;
		this.vy = 0;

		this._layer = 0;

		this.children = [];
		this.parent = undefined;

		this.shadow = false;
		this.shadowColor = 'rgba(100, 100, 100, 0.5)';
		this.shadowOffsetX = 2;
		this.shadowOffsetY = 2;
		this.shadowBlur = 3;

		this.blendMode = undefined;

		this.frames = [];
		this.loop = true;
		this._currentFrame = 0;
		this.playing = false;
		this._draggable = undefined;

		this._circular = false;

		this._interactive = false;

		this.previousX = 0;
		this.previousY = 0;

		this.init();
	}

	get offsetX() {
		return this._offsetX;
	}

	get offsetY() {
		return this._offsetY;
	}

	get width() {
		return this._width;
	}

	set width(value) {
		this._width = value;
		this._offsetX = this._width * this._anchorX;
	}

	get height() {
		return this._height;
	}

	set height(value) {
		this._height = value;
		this._offsetY = this._height * this._anchorY;
	}

	get anchorX() {
		return this._anchorX;
	}

	set anchorX(value) {
		this._anchorX = value;
		this._offsetX = this._width * this._anchorX;
	}

	get anchorY() {
		return this._anchorY;
	}

	set anchorY(value) {
		this._anchorY = value;
		this._offsetY = this._height * this._anchorY;
	}

	setAnchorPoint(x, y) {
		this.anchorX = x;
		this.anchorY = y;
		this._offsetX = this._width * this.anchorX;
		this._offsetY = this._height * this.anchorY;
	}

	getAnchorPoint() {
		return {x: this.anchorX, y: this.anchorY};
	}

	get gx() {
		if (this.parent) {
			return this.x + this.parent.gx - this.parent._offsetX;
		} else {
			return this.x;
		}
	}

	get gy() {
		if (this.parent) {
			return this.y + this.parent.gy - this.parent._offsetY;
		} else {
			return this.y;
		}
	}

	get layer() {
		return this._layer;
	}

	set layer(value) {
		this._layer = value;
		if (this.parent) {
			this.parent.children.sort(function (a, b) {
				return a.layer - b.layer;
			});
		}
	}

	addChild(sprite) {
		if (sprite.parent) {
			sprite.parent.removeChild(sprite);
		}
		sprite.parent = this;
		this.children.push(sprite);
		this.children.sort(function (a, b) {
			return a.layer - b.layer;
		});
		//console.log('-- push type: ' + sprite.type);
		//console.log('stage.length-: ' + this.children.length);
	}

	removeChild(sprite) {
		if (sprite.parent === this) {
			let index = this.children.indexOf(sprite);
			if (index > -1) this.children.splice(index, 1);
			sprite.parent = null;
		}
	}

	removeTrue(...sprites) {
		//console.log(sprites);
		sprites.forEach(sprite => {
			if (!sprite)return;
			if (sprite instanceof Array) {
				sprite.forEach(obj=> {
					this.removeTrue(obj);
				});
			} else {
				if (sprite.children.length > 0)sprite.removeTrue(sprite.children);
				sprite.interactive = false;
				this.removeChild(sprite);
			}
		});
	}

	removeAll() {
		this.children.forEach(sprite => {
			sprite.interactive = false;
		});
		this.children = [];
	}

	get halfWidth() {
		return this._width >> 1;
	}

	get halfHeight() {
		return this._height >> 1;
	}

	get centerX() {
		return this.x - this._offsetX + this.halfWidth;
	}

	get centerY() {
		return this.y - this._offsetY + this.halfHeight;
	}

	get position() {
		return {
			x: this.x,
			y: this.y
		};
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}

	get localBounds() {
		return {
			x: 0,
			y: 0,
			width: this._width,
			height: this._height
		};
	}

	get globalBounds() {
		return {
			x: this.gx,
			y: this.gy,
			width: this.gx + this._width,
			height: this.gy + this._height
		};
	}

	get isEmpty() {
		if (this.children.length === 0) {
			return true;
		} else {
			return false;
		}
	}

	putCenter(b, offsetX = 0, offsetY = 0) {
		let a = this;
		b.x = (a.x + a.halfWidth - b.halfWidth + b._offsetX - a._offsetX ) + offsetX;
		b.y = (a.y + a.halfHeight - b.halfHeight + b._offsetY - a._offsetY) + offsetY;
		console.log(`b.x: ${b.x} | b.y: ${b.y}`);
	}

	putTop(b, offsetX = 0, offsetY = 0) {
		let a = this;
		b.x = (a.x + a.halfWidth - b.halfWidth + b._offsetX - a._offsetX) + offsetX;
		b.y = (a.y - b.height + b._offsetY - a._offsetY) + offsetY;
	}

	putRight(b, offsetX = 0, offsetY = 0) {
		let a = this;
		b.x = (a.x + a.width + b._offsetX - a._offsetX) + offsetX;
		b.y = (a.y + a.halfHeight - b.halfHeight + b._offsetY - a._offsetY) + offsetY;
	}

	putBottom(b, offsetX = 0, offsetY = 0) {
		let a = this;
		b.x = (a.x + a.halfWidth - b.halfWidth + b._offsetX - a._offsetX) + offsetX;
		b.y = (a.y + a.height + b._offsetY - a._offsetY) + offsetY;
	}

	putLeft(b, offsetX = 0, offsetY = 0) {
		let a = this;
		b.x = (a.x - b.width + b._offsetX - a._offsetX) + offsetX;
		b.y = (a.y + a.halfHeight - b.halfHeight + b._offsetY - a._offsetY) + offsetY;
	}

	swapChildren(child1, child2) {
		let index1 = this.children.indexOf(child1),
			index2 = this.children.indexOf(child2);
		if (index1 !== -1 && index2 !== -1) {
			this.children[index1] = child2;
			this.children[index2] = child1;
		} else {
			throw new Error('Both objects must be a child of caller [' + this + ']');
		}
	}

	add(...spritesToAdd) {
		spritesToAdd.forEach(sprite => {
			this.addChild(sprite);
		});
	}

	remove(...spritesToRemove) {
		spritesToRemove.forEach(sprite => {
			this.removeChild(sprite);
		});
	}

	get currentFrame() {
		return this._currentFrame;
	}

	get circular() {
		return this._circular;
	}

	set circular(value) {
		if (value === true && this._circular === false) {
			Object.defineProperties(this, {
				diameter: {
					get() {
						return this.width;
					},
					set(value) {
						this.width = value;
						this.height = value;
					},
					enumerable: true, configurable: true
				},
				radius: {
					get() {
						return this.halfWidth;
					},
					set(value) {
						this.width = value < 1;
						this.height = value < 1;
					},
					enumerable: true, configurable: true
				}
			});
			this._circular = true;
		}

		if (value === false && this._circular === true) {
			delete this.diameter;
			delete this.radius;
			this._circular = false;
		}
	}

	get draggable() {
		return this._draggable;
	}

	set draggable(value) {
		if (value === true) {
			draggableSprites.push(this);
			this._draggable = true;
		}
		if (value === false) {
			let index = draggableSprites.indexOf(this);
			if (index > -1) draggableSprites.splice(index, 1);
		}
	}

	get interactive() {
		return this._interactive;
	}

	set interactive(value) {
		if (value === true) {
			makeInteractive(this);
			let index = buttons.indexOf(this);
			if (index < 0) {
				buttons.push(this);
				buttons.sort(function (a, b) {
					return -(a.layer - b.layer);
				});
			}
			this._interactive = true;
		} else if (value === false) {
			let index = buttons.indexOf(this);
			if (index > -1)  buttons.splice(index, 1);
			this._interactive = false;
		}
	}

	render(ctx) {
		ctx.translate(this._offsetX, this._offsetY);
	}

	//gameloop自动调用刷新
	myAction() {
	}

	//construct调用初始化
	init() {
	}
}

export let stage = new DisplayObject();
stage.setAnchorPoint(0, 0);
export let canvasscale;

export let canvas_display, bili_w, bili_h;
export function makeCanvas({id= 'canvas',  width = 256, height = 256,  border = '1px dashed black',  backgroundColor = 'white',rw=1,rh=1}
	= {
	id: 'canvas',
	width: 256, height: 256,
	border: '1px dashed black',
	backgroundColor: 'white', rw: 1, rh: 1
}) {
	document.body.style.margin = 0;
	let canvas = document.createElement('canvas');
	canvas.id = id;
	canvas.width = width;
	canvas.height = height;
	bili_w = rw;
	bili_h = rh;
	//canvas.rw = rw;
	//canvas.rh = rh;
	//canvasscale = rw / width;
	//canvas.style.border = border;//边框
	canvas.style.border = null;
	canvas.style.display = 'block';
	canvas.style.backgroundColor = backgroundColor;
	canvas.ctx = canvas.getContext('2d');
	canvas.ctx.globalAlpha = 0;
	document.body.appendChild(canvas);
	canvas_display = canvas;
	return canvas;
}

export function render(canvas) {
	let ctx = canvas.ctx;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// stage.children.forEach(function(sprite) {
	//   displaySprite(sprite);
	// });
	displaySprite(stage, 1);

	function displaySprite(sprite, isstage) {
		if (sprite.visible && sprite.gx < canvas.width + sprite._width
			&& sprite.gx + sprite._width >= -sprite._width
			&& sprite.gy < canvas.height + sprite._height
			&& sprite.gy + sprite._height >= -sprite._height) {

			ctx.save();
			// ctx.translate(sprite.x + (sprite.width * sprite.pivotX),
			//               sprite.y + (sprite.height * sprite.pivotY));
			ctx.translate(sprite.x, sprite.y);
			ctx.rotate(sprite.rotation);
			ctx.scale(sprite.scaleX, sprite.scaleY);
			//if(isstage)ctx.scale(canvas.width/canvas.ow,canvas.height/canvas.oh);

			if (sprite.parent) {
				ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;
			}

			// Display the sprite's optional drop shadow
			if (sprite.shadow) {
				ctx.shadowColor = sprite.shadowColor;
				ctx.shadowOffsetX = sprite.shadowOffsetX;
				ctx.shadowOffsetY = sprite.shadowOffsetY;
				ctx.shadowBlur = sprite.shadowBlur;
			}

			// Display the optional blend mode
			if (sprite.blendMode) {
				ctx.globalCompositeOperation = sprite.blendMode;
			}

			if (sprite.render) sprite.render(ctx);

			if (sprite.children && sprite.children.length > 0) {
				// ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);
				// ctx.translate(-sprite.x,-sprite.y);
				ctx.translate(-sprite._offsetX, -sprite._offsetY);
				sprite.children.forEach(function (child) {
					displaySprite(child);
				});
			}
			ctx.restore();
		}
	}
}

export function renderWithInterpolation(canvas, lagOffset) {
	let ctx = canvas.ctx;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// stage.children.forEach((sprite) => {
	//   displaySprite(sprite);
	// });
	displaySprite(stage);

	function displaySprite(sprite) {
		if (sprite.visible && sprite.gx < canvas.width + sprite._width
			&& sprite.gx + sprite._width >= -sprite._width
			&& sprite.gy < canvas.height + sprite._height
			&& sprite.gy + sprite._height >= -sprite._height) {

			ctx.save();

			if (sprite.previousX != undefined) {
				sprite.renderX = (sprite.x - sprite.previousX) * lagOffset + sprite.previousX;
			} else {
				sprite.renderX = sprite.x;
			}

			if (sprite.previousY != undefined) {
				sprite.renderY = (sprite.y - sprite.previousY) * lagOffset + sprite.previousY;
			} else {
				sprite.renderY = sprite.y;
			}

			ctx.translate(sprite.renderX, sprite.renderY);
			ctx.rotate(sprite.rotation);
			ctx.scale(sprite.scaleX, sprite.scaleY);

			if (sprite.parent)
				ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;

			// Display the sprite's optional drop shadow
			if (sprite.shadow) {
				ctx.shadowColor = sprite.shadowColor;
				ctx.shadowOffsetX = sprite.shadowOffsetX;
				ctx.shadowOffsetY = sprite.shadowOffsetY;
				ctx.shadowBlur = sprite.shadowBlur;
			}

			// Display the optional blend mode
			if (sprite.blendMode) {
				ctx.globalCompositeOperation = sprite.blendMode;
			}

			if (sprite.render) sprite.render(ctx);

			if (sprite.children && sprite.children.length > 0) {
				// ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);
				sprite.children.forEach(function (child) {
					displaySprite(child);
				});
			}
			ctx.restore();
		}
	}
}

export function addStatePlayer(sprite) {

	function show(frameNumber) {
		sprite.gotoAndStop(frameNumber);
	}

	sprite.show = show;
}

export function capturePreviousPositions() {
	stage.children.forEach(function (sprite) {
		setPreviousPosition(sprite);
	});
	function setPreviousPosition(sprite) {
		sprite.previousX = sprite.x;
		sprite.previousY = sprite.y;

		if (sprite.children && sprite.children.length > 0) {
			sprite.children.forEach(function (child) {
				setPreviousPosition(child);
			});
		}
	}
}

class Rectangle extends DisplayObject {
	constructor(width = 32,
	            height = 32,
	            fillStyle = 'gray',
	            strokeStyle = 'none',
	            lineWidth = 0,
	            x = 0, y = 0) {
		super();
		//x = parseInt(x * bili_w);
		//y = parseInt(y * bili_h);
		Object.assign(this, {
			width, height, fillStyle, strokeStyle, lineWidth, x, y
		});
		this.mask = false;
	}

	render(ctx) {
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth ? this.lineWidth : 0.000001;
		ctx.fillStyle = this.fillStyle;
		ctx.beginPath();
		ctx.rect(-this._offsetX, -this._offsetY,
			this.width,
			this.height);
		if (this.strokeStyle !== 'none') ctx.stroke();
		if (this.fillStyle !== 'none') ctx.fill();
		if (this.mask && this.mask === true) ctx.clip();
	}
}

export function rectangle(width, height, fillStyle, strokeStyle, lineWidth, x, y) {
	width = calcPx(width);
	height = calcPx(height, 1);
	x = calcPx(x);
	y = calcPx(y, 1);
	let sprite = new Rectangle(width, height, fillStyle, strokeStyle, lineWidth, x, y);
	stage.addChild(sprite);
	return sprite;
}

class Circle extends DisplayObject {
	constructor(diameter = 32,
	            fillStyle = 'gray',
	            strokeStyle = 'none',
	            lineWidth = 0,
	            x = 0,
	            y = 0) {
		super();
		this.circular = true;
		//x = parseInt(x * bili_w);
		//y = parseInt(y * bili_h);
		Object.assign(
			this, {
				diameter, fillStyle, strokeStyle, lineWidth, x, y
			}
		);
		this.mask = false;
	}

	render(ctx) {
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth ? this.lineWidth : 0.000001;
		ctx.fillStyle = this.fillStyle;
		ctx.beginPath();
		ctx.arc(
			this.radius + (-this.diameter * this._anchorX),
			this.radius + (-this.diameter * this._anchorY),
			this.radius,
			0, 2 * Math.PI,
			false
		);
		if (this.strokeStyle !== 'none') ctx.stroke();
		if (this.fillStyle !== 'none') ctx.fill();
		if (this.mask && this.mask === true) ctx.clip();
	}
}

export function circle(diameter, fillStyle, strokeStyle, lineWidth, x, y) {
	let sprite = new Circle(diameter, fillStyle, strokeStyle, lineWidth, x, y);
	stage.addChild(sprite);
	return sprite;
}

class Line extends DisplayObject {
	constructor(strokeStyle = 'none',
	            lineWidth = 0,
	            ax = 0,
	            ay = 0,
	            bx = 32,
	            by = 32) {
		super();
		Object.assign(this, {
			strokeStyle, lineWidth, ax, ay, bx, by
		});
		this.lineJoin = 'round';
	}

	render(ctx) {
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth ? this.lineWidth : 0.000001;
		ctx.lineJion = this.lineJoin;
		ctx.beginPath();
		ctx.moveTo(this.ax, this.ay);
		ctx.lineTo(this.bx, this.by);
		if (this.strokeStyle !== 'none') ctx.stroke();
	}
}

export function line(strokeStyle, lineWidth, ax, ay, bx, by) {
	let sprite = new Line(strokeStyle, lineWidth, ax, ay, bx, by);
	stage.addChild(sprite);
	return sprite;
}

export class Text extends DisplayObject {
	constructor(content = 'Hello!',
	            font = '12px sans-serif',
	            fillStyle = 'red',
	            x = 0,
	            y = 0,
	            layer = 0) {
		super();
		//x = parseInt(x * bili_w);
		//y = parseInt(y * bili_h);
		//let fontsize = parseInt(font);
		//if (fontsize > 0) {
		//	let rs = parseInt(fontsize * bili_w);
		//	font = font.replace(fontsize, rs);
		//}
		this.textBaseline = 'top';
		this.align = 'left';
		this.strokeText = 'none';
		Object.assign(this, {content, font, fillStyle, x, y});
		this.layer = layer;
	}

	render(ctx) {
		ctx.font = this.font;
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth;
		ctx.fillStyle = this.fillStyle;

		if (this.width === 0) this.width = ctx.measureText(this.content).width;
		if (this.height === 0) this.height = ctx.measureText('M').width;

		ctx.translate(-this._offsetX, -this._offsetY);
		ctx.textBaseline = this.textBaseline;
		ctx.textAlign = this.align;
		ctx.fillText(this.content, 0, 0);
		if (this.strokeText !== 'none') ctx.strokeText();
	}
}

export function text(content, font, fillStyle, x, y, layer, parent) {
	x = calcPx(x);
	y = calcPx(y, 1);
	let fontsize = parseInt(font);
	if (fontsize > 0) {
		let rs = parseInt(fontsize * bili_w);
		font = font.replace(fontsize, rs);
		//console.log(font);
	}
	let sprite = new Text(content, font, fillStyle, x, y, layer);
	if (parent) parent.addChild(sprite);
	else stage.addChild(sprite);
	return sprite;
}

class Group extends DisplayObject {
	constructor(...spritesToGroup) {
		super();
		spritesToGroup.forEach((sprite) => {
			this.addChild(sprite);
		});
	}

	addChild(sprite) {
		if (sprite.parent) {
			sprite.parent.removeChild(sprite);
		}
		sprite.parent = this;
		this.children.push(sprite);
		this.calculateSize();
	}

	removeChild(sprite) {
		if (sprite.parent === this) {
			let index = this.children.indexOf(sprite);
			if (index > -1) this.children.splice(index, 1);
			sprite.parent = null;
			this.calculateSize();
		}
	}

	// 好像有点问题
	calculateSize() {
		if (this.children.length > 0) {
			this._newWidth = 0;
			this._newHeight = 0;
			this.children.forEach(child => {
				if (child.x + child.width > this._newWidth) {
					this._newWidth = child.x + child.width;
				}
				if (child.y + child.height > this._newHeight) {
					this._newHeight = child.y + child.height;
				}
			});
			this.width = this._newWidth;
			this.height = this._newHeight;
		}
	}
}

export function group(...spritesToGroup) {
	let sprite = new Group(...spritesToGroup);
	stage.addChild(sprite);
	return sprite;
}

export class Sprite extends DisplayObject {
	constructor(source, x = 0, y = 0, ops = null) {
		super();
		//alert("super-a");//android cordova打包后，运行完这句就停止了
		//x = parseInt(x * bili_w);
		//y = parseInt(y * bili_h);
		Object.assign(this, {x, y});
		//alert("super-a2");//并未执行
		Object.assign(this, ops);

		if (source instanceof Image) {
			this.createFromImage(source);
		} else if (source.frame) {
			this.createFromAtlas(source);
		} else if (source.image && !source.data) {
			this.createFromTileset(source);
		} else if (source.image && source.data) {
			this.createFromTilesetFrames(source);
		} else if (source instanceof Array) {
			if (source[0] && source[0].source) {
				this.createFromAtlasFrames(source);
			} else if (source[0] instanceof Image) {
				this.createFromImages(source);
			} else {
				throw new Error('The image source in ' + source + ' are not recongnized');
			}
		} else {
			throw new Error('The image source ' + source + ' is not recongnized');
		}
	}

	createFromImage(source) {
		if (!(source instanceof Image)) {
			throw new Error(`${source} is not an image object`);
		} else {
			this.source = source;
			this.sourceX = 0;
			this.sourceY = 0;
			this.width = source.width;
			this.height = source.height;
			this.sourceWidth = source.width;
			this.sourceHeight = source.height;
		}
	}

	createFromAtlas(source) {
		// this.tileset_frame = source;
		this.source = source.source;
		this.sourceX = source.frame.x;
		this.sourceY = source.frame.y;
		this.width = source.frame.w;
		this.height = source.frame.h;
		this.sourceWidth = source.frame.w;
		this.sourceHeight = source.frame.h;
	}

	createFromTileset(source) {
		if (!(source.image instanceof Image)) {
			throw new Error(`${source.image} is not an image object`);
		} else {
			this.source = source.image;
			this.sourceX = source.x;
			this.sourceY = source.y;
			this.width = source.width;
			this.height = source.height;
			this.sourceWidth = source.width;
			this.sourceHeight = source.height;
		}
	}

	createFromTilesetFrames(source) {
		if (!(source.image instanceof Image)) {
			throw new Error(`${source.image} is not an image object`);
		} else {
			this.source = source.image;
			this.frames = source.data;
			this.sourceX = this.frames[0][0];
			this.sourceY = this.frames[0][1];
			this.width = source.width;
			this.height = source.height;
			this.sourceWidth = source.width;
			this.sourceHeight = source.height;
		}
	}

	createFromAtlasFrames(source) {
		this.frames = source;
		this.source = source[0].source;
		this.sourceX = source[0].frame.x;
		this.sourceY = source[0].frame.y;
		this.width = source[0].frame.w;
		this.height = source[0].frame.h;
		this.sourceWidth = source[0].frame.w;
		this.sourceHeight = source[0].frame.h;
	}

	createFromImages(source) {
		this.frames = source;
		this.source = source[0];
		this.sourceX = 0;
		this.sourceY = 0;
		this.width = source[0].width;
		this.height = source[0].height;
		this.sourceWidth = source[0].width;
		this.sourceHeight = source[0].height;
	}

	gotoAndStop(frameNumber) {
		if (this.frames.length > 0 && frameNumber < this.frames.length) {
			if (this.frames[0] instanceof Array) {
				this.sourceX = this.frames[frameNumber][0];
				this.sourceY = this.frames[frameNumber][1];
			} else if (this.frames[frameNumber].frame) {
				this.sourceX = this.frames[frameNumber].frame.x;
				this.sourceY = this.frames[frameNumber].frame.y;
				this.sourceWidth = this.frames[frameNumber].frame.w;
				this.sourceHeight = this.frames[frameNumber].frame.h;
				this.width = this.frames[frameNumber].frame.w;
				this.height = this.frames[frameNumber].frame.h;
			} else {
				this.source = this.frames[frameNumber];
				this.sourceX = 0;
				this.sourceY = 0;
				this.sourceWidth = this.source.width;
				this.sourceHeight = this.source.height;
				this.width = this.source.width;
				this.height = this.source.height;
			}
			this._currentFrame = frameNumber;
		} else {
			throw new Error(`Frame number ${frameNumber} does not exist`);
		}
	}

	render(ctx) {
		let parent = this.parent;
		if (parent && parent != stage && !parent.showoutpart) {//组件的一部分，可能只显示局部
			if (this.x <= -this._offsetX || this.x >= parent._width + this._offsetX)return;
			if (this.y <= -this._offsetY || this.y >= parent._height + this._offsetY)return;
			let wr = this.sourceWidth / this._width, hr = this.sourceHeight / this._height;//图片绘制与实际显示的宽高比例

			//let sx = parent._offsetX >= this._offsetX ? this.sourceX : this._offsetX - parent._offsetX;
			//let sy = parent._offsetY >= this._offsetY ? this.sourceY : this._offsetY - parent._offsetY;
			let sx, sy, sex, sey, sw, sh, x, y, w, h;
			//图片显示起点
			if (this.x > this._offsetX)x = -this._offsetX;
			else x = -this.x;
			if (this.y > this._offsetY)y = -this._offsetY;
			else y = -this.y;

			//图片的绘制起点
			sx = this._offsetX - this.x;
			if (sx <= 0) sx = 0;//起点在parent内
			sy = this._offsetY - this.y;
			if (sy <= 0) sy = 0;

			//图片的绘制终点
			sex = this._offsetX + this.x;//显示的终点（最右边的点）
			if (sex <= parent._width)  w = this._width - sx;//终点在parent内
			else  w = this._offsetX - this.x + parent._width;//终点在parent右边

			sey = this._offsetY + this.y;
			if (sey <= parent._height) h = this._height - sy;
			else h = this._offsetY - this.y + parent._height;

			//图片切割点，切割宽高
			sx = parseInt(sx * wr);
			sy = parseInt(sy * hr);
			sw = parseInt(w * wr);
			sh = parseInt(h * hr);

			ctx.drawImage(this.source, sx, sy, sw, sh, x, y, w, h);
			if (this.interactive) {
				let ex, ey;
				if (this.x < this._width)ex = -this.x;
				else ex = x;
				if (this.y < this._height)ey = -this.y;
				else ey = y;
				this.eventx = ex;
				this.eventy = ey;
				this.eventw = w;
				this.eventh = h;
			}
		} else {
			ctx.drawImage(
				this.source, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight,
				-this._offsetX, -this._offsetY, this._width, this._height
			);
		}
	}
}

export function sprite(source, x, y, ops) {
	let sprite = new Sprite(source, x, y, ops);
	var fa = (ops && ops.father) || stage;
	fa.addChild(sprite);
	return sprite;
}

export function spritE(source, x, y, w, h, layer, ops) {
	x = calcPx(x);
	y = calcPx(y, 1);
	w = calcPx(w);
	h = calcPx(h, 1);
	let s = sprite(source, x, y, ops);
	s.width = w || 0;
	s.height = h || 0;
	s.layer = layer || 0;
	return s;
}

export function newMyButton(source, x, y, w, h, layer, ops) {
	let b = spritE(source, x, y, w, h, layer, ops);
	b.interactive = true;
	return b;
}

export function frame(source, x, y, width, height) {
	let o = {};
	o.image = source;
	o.x = x;
	o.y = y;
	o.width = width;
	o.height = height;
	return o;
}

export function frames(source, arrayOfPositions, width, height) {
	let o = {};
	o.image = source;
	o.data = arrayOfPositions;
	o.width = width;
	o.height = height;
	return o;
}

class Button extends Sprite {
	constructor(source, x = 0, y = 0) {
		super(source, x, y);
		this.interactive = true;
	}
}

export function button(source, x, y) {
	let sprite = new Button(source, x, y);
	stage.addChild(sprite);
	return sprite;
}

//大地图，qh添加，通过改变sourceX和sourceY改变绘制范围
class BigMap extends Sprite {
	constructor(source, x, y, w, h, layer, fixedW, fixedH) {
		super(source, x, y);
		this.width = w;
		this.height = h;
		this.layer = layer || 0;
		this.fixedW = fixedW || this.sourceWidth;
		this.fixedH = fixedH || this.sourceHeight;
		//console.log("w:"+this.fixedW+",h:"+this.fixedH);
	}

	render(ctx) {
		ctx.drawImage(this.source, this.sourceX, this.sourceY, this.fixedW, this.fixedH,
			-this._offsetX, -this._offsetY, this._width, this._height);
	}
}

export function bigmap(source, x, y, w, h, layer, fw, fh) {
	x = calcPx(x);
	y = calcPx(y, 1);
	w = calcPx(w);
	h = calcPx(h, 1);
	let bm = new BigMap(source, x, y, w, h, layer, fw, fh);
	stage.add(bm);
	return bm;
}

export function remove(...spritesToRemove) {
	spritesToRemove.forEach(function (sprite) {
		sprite.parent.removeChild(sprite);
	});
}

function makeInteractive(o) {
	o.press = o.press || undefined;
	o.release = o.release || undefined;
	o.over = o.over || undefined;
	o.out = o.out || undefined;
	o.tap = o.tap || undefined;

	o.state = 'up';
	o.action = '';
	o.longpressed = o.pressed = o.hoverOver = false;
	o.tapnum = o.overtime = 0;
	o.downTime = null;
	let doubleclicktime = 350;

	o.update = (pointer) => {
		let hit = pointer.hitTestSprite(o);
		o.pointx = pointer.x;
		o.pointy = pointer.y;

		if (hit) {//命中
			if (pointer.isDown) {
				if (o.state == 'out') {
					if (o.moveIn) {
						o.moveIn(o);//按住移进
					}
					o.pressed = true;
					o.action = 'pressed';
					o.downTime = Date.now();
				} else if (o.state == 'up') {
					o.downTime = Date.now();
				}
				o.state = 'down';
				if (o instanceof Button) {
					(o.frames.length === 3) ?
						o.gotoAndStop(2) :
						o.gotoAndStop(1);
				}
			} else if (pointer.isUp) {
				if (o.state == 'down') {
					o.state = 'up';
				} else {
					o.state = 'over';
					if (o.over) {
						o.over(o);//在表面，长期
					}
				}
				if (o.frames && o.frames.length === 3 && o instanceof Button) {
					o.gotoAndStop(1);
				}
			}
		} else {//没命中
			if (o instanceof Button) o.gotoAndStop(0);
			if (o.state == 'down' && o.moveOut) {
				o.moveOut(o);//按住移出
			}
			o.state = 'out';
			o.longpressed = o.pressed = false;
			if (o.downTime)o.downTime = null;
		}

		if (o.state === 'down') {
			if (!o.pressed && o.press) {
				o.press(o);//按下
			}
			o.pressed = true;
			o.action = 'pressed';
			if (o.downTime == null)  o.downTime = pointer.downTime;
			if (Math.abs(o.pointx - o.pointpx) < 5 && Math.abs(o.pointy - o.pointpy) < 5) {// 按住不动
				if (o.downTime) o.elapsedTime = Date.now() - o.downTime;
				else o.elapsedTime = 0;
				if (o.elapsedTime > 800) {//长按判定时间为800毫秒
					if (o.longPress && !o.longpressed) {
						o.longPress(o);//长按
						o.longpressed = true;
					}
					if (o.pressinG) {
						o.pressinG();//长按住不放，持续
					}
				}
			} else if (o.move) {
				o.move(o);//按住移动，移动超过5px触发
			}
		}

		if (pointer.elapsedTime > doubleclicktime || Date.now() - o.overtime > doubleclicktime)o.tapnum = 0;
		if (o.state === 'up') {
			if (pointer.prepDown > 0) {
				pointer.prepDown--;
				if (o.pressed) {
					if (pointer.tapped) {
						o.tapnum++;
						if (o.tapnum == 2 && o.doubleClick) {
							o.tapnum = 0;
							o.doubleClick(o);//双击,触发双击就不会触发轻点,若没有双击事件则调用轻点
						} else if (o.tap) {
							o.tap(o);//轻点
						}
					} else if (o.longpressed && o.longClick) {
						o.longClick(o);//长点击
					}
					if (o.release) {
						o.release(o);//释放
					}
				}
			}
			o.longpressed = o.pressed = false;
			o.downTime = null;
			o.action = 'released';
			o.overtime = Date.now();
		}

		if (o.state === 'out' && o.out) {
			o.out(o);//没在事件之上，长期
			o.longpressed = o.pressed = false;
			o.downTime = null;
		}

		o.pointpx = o.pointx;//将当前帧的触点位置赋给上幀记录
		o.pointpy = o.pointy;
	};
}

//按比例计算预想值对应的实际像素,x传预想值，h传是否是y轴方向（当x轴y轴比例不同时需要）
export function calcPx(x, h) {
	if (h)return parseInt(x * bili_h);
	return parseInt(x * bili_w);
}

//计算预想值，传入实际像素
export function calcYuxiangPx(x, h) {
	if (h)return parseInt(x / bili_h);
	return parseInt(x / bili_w);
}

//gameloop中调用，没加在stage中，但是父类是在stage中的组件刷新逻辑
export function doMyAction(o) {
	if (!(o instanceof Array) || o.length <= 0) return;
	o.forEach((child)=> {
		if (child.myAction) child.myAction();
		doMyAction(child.children);
	});
}
