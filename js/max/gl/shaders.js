import {
  assets
}
from '../utilities.js';
import SimpleShader from './shaders/simple-shader.js';
import TextureShader from './shaders/texture-shader.js';


let kSimpleVS = 'shaders/simple-vs.glsl';
let kSimpleFS = 'shaders/simple-fs.glsl';
let kTextureVS = 'shaders/texture-vs.glsl';
let kTextureFS = 'shaders/texture-fs.glsl';

let shaders = {
  constColorShader: null,
  textureShader: null,

  init: function(callback = () => {}) {
    assets.load([
      kSimpleVS, kSimpleFS, kTextureVS, kTextureFS
    ]).then(() => {
      this.constColorShader = new SimpleShader(kSimpleVS, kSimpleFS);
      this.textureShader = new TextureShader(kTextureVS, kTextureFS);
      callback();
    });
  }
};


export default shaders;

