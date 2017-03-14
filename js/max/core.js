import vertexBuffers from './gl/vertex-buffers.js';
import shaders from './gl/shaders.js';
import GameLoop from './game-loop.js';


export default class Max {
  static init(gameClass, canvas = 'webgl') {
    if (canvas === 'webgl') {
      this.initWebGL({width:640});
      this.gameLoop = new GameLoop();

      vertexBuffers.init();
      // run gameloop when shaders loaded
      shaders.init(() => { this.gameLoop.start(new gameClass()); });
    }
  }

  static initWebGL({
    id= 'canvas',
    width= 640, height= 960,
    border= '1px dashed black',
    backgroundColor= 'white',
    antialias= true
  } = {
    id: 'canvas',
    width: 640, height: 480,
    border: '1px dashed black',
    backgroundColor: 'white',
    antialias: true
  })
 {
    if (Max.gl) {
      alert('WebGL already exists!');
    } else {
      this.canvas = document.getElementById(id) ||
          document.createElement('canvas');
      Object.assign(this.canvas, {
        id, width, height
      });
      Object.assign(this.canvas.style, {
        border, backgroundColor
      });

      document.body.appendChild(this.canvas);
      this.gl = this.canvas.getContext('webgl', {
        alpha: false,
        antialias: antialias
      }) ||
        this.canvas.getContext('experimental-webgl', {
          alpha: false,
          antialias: antialias
        });

      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.enable(this.gl.BLEND);
      
      if (this.gl === null) {
        alert('WebGL is not supported!');
      }

      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

      console.log('antialias: ' + this.gl.getContextAttributes().antialias +
                  ' level: ' + this.gl.getParameter(this.gl.SAMPLES));
    }
    return this.gl;
  }

  static clearCanvas(color = [1, 1, 1, 1]) {
   this.gl.clearColor(color[0], color[1], color[2], color[3]);
   this.gl.clear(this.gl.COLOR_BUFFER_BIT);
 }
};

Max.gl = null;

