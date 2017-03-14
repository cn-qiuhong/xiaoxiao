let getInputPoint = function (event) {
	let element = event.target;
	var point = {
		x: (event.pageX || event.clientX + document.body.scrollLeft) - element.offsetLeft,
		y: (event.pageY || event.clientY + document.body.scrollTop) - element.offsetTop
	};

	// if(T.scale) {
	//   point.x /= T.scale.x;
	//   point.y /= T.scale.y;
	// }
	// console.log("point.x"+point.x);
	// console.log("point.y"+point.y);
	return point;
};

let upendHandler = function (event) {
	//console.log("upend");
	this.elapsedTime = Math.abs(this.downTime - Date.now());
	if (this.elapsedTime <= this.tappedDelay && this.tapped === false) {
		this.tapped = true;
		if (this.tap) this.tap();
	}
	this.isUp = true;
	this.prepDown = 1;
	this.isDown = false;
	if (this.release) {
		this.release();
	}
	event.preventDefault();
};

export function makePointer(element, scale = 1) {
	let pointer = {
		element: element,
		scale: scale,
		_x: 0,
		_y: 0,

		get x() {
			return this._x / this.scale;
		},
		get y() {
			return this._y / this.scale;
		},

		get centerX() {
			return this.x;
		},
		get centerY() {
			return this.y;
		},

		get position() {
			return {
				x: this.x,
				y: this.y
			};
		},

		isDown: false,
		isUp: true,
		tapped: false,
		prepDown: 0,
		tappedDelay: 300,
		downTime: 0,
		elapsedTime: 0,
		press: undefined,
		release: undefined,
		tap: undefined,
		// a 'dragSprite' property to help with drag and drop
		dragSprite: null,
		dragOffsetX: 0,
		dragOffsetY: 0,

		moveHandler: function (event) {
			let point = getInputPoint(event);
			this._x = point.x;
			this._y = point.y;

			event.preventDefault();
		},

		touchMoveHandler: function (event) {
			let point = getInputPoint(event.targetTouches[0]);
			this._x = point.x;
			this._y = point.y;

			event.preventDefault();
		},

		downHandler: function (event) {
			this.isDown = true;
			this.isUp = false;
			this.tapped = false;
			this.downTime = Date.now();
			if (this.press) this.press();
			event.preventDefault();
		},

		touchStartHandler: function (event) {
			let point = getInputPoint(event.targetTouches[0]);
			this._x = point.x;
			this._y = point.y;
			//console.log("touchStart:" + this._x + "+" + this._y);
			this.isDown = true;
			this.isUp = false;
			this.tapped = false;
			this.downTime = Date.now();
			if (this.press) this.press();
			event.preventDefault();
		},

		upHandler: function (event) {
			upendHandler.call(this, event);
		},

		touchEndHandler: function (event) {
			upendHandler.call(this, event);
		},

		hitTestSprite: function (sprite) {

			let hit = false;

			let offsetX = sprite._offsetX,
				offsetY = sprite._offsetY;

			// 矩形,非圆
			if (!sprite.circular) {
				let left, right, top, bottom;
				if (sprite.eventx !== undefined) {//是其他元素的组件，划分了事件区域
					//console.log("interactive");
					left = sprite.gx + sprite.eventx;
					right = left + sprite.eventw;
					top = sprite.gy + sprite.eventy;
					//console.log("gy:" + sprite.gy + ",ey:" + sprite.eventy);
					bottom = top + sprite.eventh;
					//console.log("l:" + left + ",r:" + right + ",t:" + top + ",b:" + bottom);
					//console.log("x:" + this.x + ",y:" + this.y);
				} else {
					left = sprite.gx - offsetX;
					right = sprite.gx + sprite.width - offsetX;
					top = sprite.gy - offsetY;
					bottom = sprite.gy + sprite.height - offsetY;
				}
				hit = this.x > left && this.x < right && this.y > top && this.y < bottom;
			} else {// 圆
				let vx, vy;
				if (sprite.eventx) {
				} else {
					vx = this.x - (sprite.gx + sprite.radius - offsetX);
					vy = this.y - (sprite.gy + sprite.radius - offsetY);
				}
				let distance = Math.sqrt(vx * vx + vy * vy);
				hit = distance < sprite.radius;
			}
			return hit;
		},

		updateDragAndDrop: function (draggableSprites) {
			if (this.isDown) {
				if (this.dragSprite === null) {
					for (let i = draggableSprites.length - 1; i > -1; --i) {
						let sprite = draggableSprites[i];
						if (this.hitTestSprite(sprite) && sprite.draggable) {
							this.dragOffsetX = this.x - sprite.gx;
							this.dragOffsetY = this.y - sprite.gy;
							this.dragSprite = sprite;
							let children = sprite.parent.children;
							children.splice(children.indexOf(sprite), 1);
							children.push(sprite);
							draggableSprites.splice(draggableSprites.indexOf(sprite), 1);
							draggableSprites.push(sprite);
							break;
						}
					}
				} else {
					this.dragSprite.x = this.x - this.dragOffsetX;
					this.dragSprite.y = this.y - this.dragOffsetY;
				}
			}

			if (this.isUp) {
				this.dragSprite = null;
			}

			draggableSprites.some((sprite)=> {
				if (this.hitTestSprite(sprite) && sprite.draggable) {
					this.element.style.cursor = 'pointer';
					return true;
				} else {
					this.element.style.cursor = 'auto';
					return false;
				}
			});
		}

	};

	element.addEventListener('mousemove', pointer.moveHandler.bind(pointer));

	element.addEventListener('mousedown', pointer.downHandler.bind(pointer));

	window.addEventListener('mouseup', pointer.upHandler.bind(pointer));

	element.addEventListener('touchmove', pointer.touchMoveHandler.bind(pointer));

	element.addEventListener('touchstart', pointer.touchStartHandler.bind(pointer));

	window.addEventListener('touchend', pointer.touchEndHandler.bind(pointer));

	// disable the default pan and zoom actions on the 'canvas'
	element.style.touchActino = 'none';

	return pointer;
}

export function keyboard(keyCode) {
	let key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;

	key.downHandler = function (event) {
		if (event.keyCode === key.code) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		event.preventDefault();
	};

	key.upHandler = function (event) {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		event.preventDefault();
	};

	window.addEventListener('keydown', key.downHandler.bind(key));
	window.addEventListener('keyup', key.upHandler.bind(key));

	return key;
}
