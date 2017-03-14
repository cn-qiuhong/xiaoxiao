import core from './core.js';

let _previousTime = 0,
    _lagTime = 0,
    _lagOffset = 0,
    _elapsedTime = 0,
    _correctTime = 1000;


export default class GameLoop{
  constructor() {
    this.FPS = 15;
    this.frame = 1 / this.FPS;
    this.MPF = 1000 / this.FPS;
    console.log('MPF: ' + this.MPF);

    this.isRunning = false;
    this.game = null;

    this.stats = null;
  }

  start(game) {
    this.game = game;
    _lagTime = 0.0;
    this.isRunning = true;
    this.gameLoop(0);
  }

  stop() {
    this.isRunning = false;
  }

  gameLoop(timestamp) {
    if (this.isRunning) {
      requestAnimationFrame((timestamp)=>{this.gameLoop(timestamp);});
      this.stats && this.stats.begin();
      _elapsedTime = timestamp - _previousTime;
      if (_elapsedTime > _correctTime) _elapsedTime = this.MPF;
      _lagTime += _elapsedTime;
      // console.log('lagTime: '+_elapsedTime);
      while (_lagTime >= this.MPF) {
        // dp.capturePreviousPositions(stage);
        this.game.update();
        _lagTime -= this.MPF;
      }
      _lagOffset = _lagTime / this.MPF;
      // dp.renderWithInterpolation(canvas, stage, _lagOffset);
      this.game.render();
      _previousTime = timestamp;
      this.stats && this.stats.end();
    }
  }

  openStats() {
    if(!this.stats) {
      this.stats = new Stats();
      this.stats.setMode(0);
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.left = `${core.canvas.width+20}px`;
      this.stats.domElement.style.top = `${core.canvas.height / 2}px`;
      document.body.appendChild(this.stats.domElement);
    }
  }

};
