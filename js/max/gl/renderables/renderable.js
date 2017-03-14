import core from '../../core.js';
import Transform from '../transform.js';
import shaders from '../shaders.js';

export default class Renderable {
  constructor(shader) {
    this.shader = shaders.constColorShader;
    this.xform = new Transform();
    this.color = [1, 1, 1, 1];
  }

  render(vpMatrix, gl = core.gl) {
    // this.shader.activeShader(this.color, vpMatrix);
    this.shader.loadObjectTransform(this.xform.getXfrom());
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
