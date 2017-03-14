import Renderable from './renderable.js';
import shaders from '../shaders.js';
import textures from '../textures.js';

export default class Texture extends Renderable {
  constructor(texture) {
    super();
    this.color = [1, 1, 1, 0];
    this.shader = shaders.textureShader;
    this.texture = texture; // texture for this object, cannot be a 'null'
  }

  render(vpMatrix) {
    // textures.activateTexture(this.texture);
    // TODO: 自动获取图片尺寸(在没有手动设置尺寸的情况下)
    super.render(vpMatrix);
  }
}

