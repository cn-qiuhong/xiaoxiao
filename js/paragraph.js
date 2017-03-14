import { stage,DisplayObject,calcPx } from './max/display.js';
import { canvas } from './t0.js';

class Paragraph extends DisplayObject {
	constructor(_text = 'Hello!', ops = {}) {
		super();
		this.width = calcPx(300);
		this.textBaseline = 'top';
		this.strokeText = 'none';
		this.align = "left";
		if (ops) {
			if (ops.width)ops.width = calcPx(ops.width);
			if (ops.x)ops.x = calcPx(ops.x);
			if (ops.y)ops.y = calcPx(ops.y, 1);
			if (ops.size)  this._size = calcPx(ops.size);
			else  this._size = 8;
		}
		Object.assign(this, ops);
		this.font = this._size + 'px 微软雅黑';
		if (ops.color)this.fillStyle = ops.color;
		else this.fillStyle = 'black';
		if (ops.layer)this.layer = ops.layer;
		this.ctx = canvas.ctx;
		this.setText(_text);
	}

	setText(_text) {
		this.texts = [];
		this.maxlength = 0;
		let start = 0, a, _width = 0, wd;
		for (let i = 0; i < _text.length; i++) {
			a = _text.charCodeAt(i);
			if (a >= 0 && a < 128) {
				wd = widthParcentOfCharCode(a);
				if (wd)_width += wd * this._size;
				else  _width += 0.31 * this._size;//符号
			} else  _width += this._size;//汉字
			if (_width > this.width || i == _text.length - 1) {
				if (i == _text.length - 1 && _width <= this.width)  i++;
				this.texts.push(_text.substr(start, i - start));
				this.maxlength++;
				if (i == _text.length)  break;
				_width = 0;
				start = i;
				i--;
			}
		}
	}

	render(ctx) {
		ctx.font = this.font;
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth;
		ctx.fillStyle = this.fillStyle;
		ctx.textAlign = this.align;
		this.height = ctx.measureText('M').width * this.maxlength;
		ctx.translate(-this._offsetX, -this._offsetY);
		ctx.textBaseline = this.textBaseline;
		for (let i = 0; i < this.texts.length; i++) {
			ctx.fillText(this.texts[i], 0, i * this._size);
			if (this.strokeText !== 'none') ctx.strokeText();
		}
	}

	removeAll() {
		this.texts = [];
	}
}

export function newParagraph(_text, ops) {
	let p = new Paragraph(_text, ops);
	stage.add(p);
	return p;
}

export function widthParcentOfCharCode(code) {
	switch (code) {
		case 108:
			return 0.26;
		case 105:
		case 106:
			return 0.27;
		case 73:
			return 0.3;
		case 102:
			return 0.36;
		case 116:
			return 0.37;
		case 74:
		case 114:
			return 0.39;
		case 115:
			return 0.46;
		case 122:
			return 0.48;
		case 99:
			return 0.5;
		case 120:
			return 0.51;
		case 76:
			return 0.52;
		case 118:
		case 121:
			return 0.53;
		case 70:
		case 107:
			return 0.54;
		case 97:
			return 0.55;
		case 69:
		case 101:
			return 0.56;
		case 83:
		case 84:
			return 0.57;
		case 48:
		case 49:
		case 50:
		case 51:
		case 52:
		case 53:
		case 54:
		case 55:
		case 56:
		case 57:
			return 0.58;
		case 80:
		case 89:
		case 90:
		case 104:
		case 110:
		case 117:
			return 0.61;
		case 66:
		case 100:
		case 103:
		case 111:
		case 113:
			return 0.63;
		case 98:
			return 0.64;
		case 75:
		case 88:
		case 112:
			return 0.65;
		case 67:
		case 82:
			return 0.67;
		case 86:
			return 0.69;
		case 65:
			return 0.7;
		case 71:
		case 85:
			return 0.74;
		case 68:
			return 0.76;
		case 72:
			return 0.78;
		case 119:
			return 0.8;
		case 78:
		case 79:
		case 81:
			return 0.81;
		case 109:
			return 0.93;
		case 77:
			return 0.98;
		case 87:
			return 1;
	}
}