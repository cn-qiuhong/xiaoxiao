import {stage,newMyButton} from './max/display.js';
import {assets} from './max/utilities.js';
import {fadeIn,scale} from './max/tween.js';
import {Knapsack} from './knapsack.js';

export class OtherMenu{
  constructor(index){
    this.index=index;
    
    this.knapsack = newMyButton(assets['images/knapsack.png'], 440, 800, 80, 80, 5);
		this.knapsack.release = ()=> {
			index.content.removeAll();
      this.hide();
			index.content = new Knapsack();
		};

    init(this.knapsack);
    
    this.show();

    function init(...os){
      os.forEach(o=>{
        o.scaleX=0.1;
        o.scaleY=0.1;
        o.interactive=false;
      });
    }
  }

  show(){
    this.showing=true;
    this.knapsack.alpha=1;
    scale(this.knapsack,1,1,20).onComplete=()=>{
      this.knapsack.interactive=true;
    };
  }

  hide(){
    this.showing=false;
    scale(this.knapsack,0.1,0.1,20).onComplete=()=>{
      this.knapsack.alpha=0;
      this.knapsack.interactive=false;
    };
  
  }
}
