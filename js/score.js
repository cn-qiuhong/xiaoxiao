import { assets } from './max/utilities';
import { Sprite,text } from './max/display.js';

export default class Score extends Sprite {
  constructor(view) {
    super(assets['images/trans.png']);
    this.view = view;
    this.score = text("SCORE  " + this.view.score, '30px 微软雅黑', 'white', 210, 90,10);
    this.score.align = 'center';//尾端对齐，动态变化时是中间对齐
  }

  myAction() {
    this.score.content = "SCORE  " + this.view.score;
  }
}