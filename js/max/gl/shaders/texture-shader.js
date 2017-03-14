import core from '../../core.js';
import assets from '../../utilities.js';
import vertexBuffers from '../vertex-buffers.js';
import SimpleShader from './simple-shader.js';

export default class TextureShader extends SimpleShader {
  constructor(vertexShaderPath, fragmentShaderPath, gl = core.gl) {
    super(vertexShaderPath, fragmentShaderPath, gl, vertexBuffers.squareVertexBuffer);
    this.shaderTextureCoordAttribute = gl.getAttribLocation(this.compiledShader,
      'aTextureCoordinate');
  }

  activeShader(pixelColor, vpMatrix, gl = core.gl) {
    super.activeShader(pixelColor, vpMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.textureCoordBuffer);
    gl.enableVertexAttribArray(this.shaderTextureCoordAttribute);
    gl.vertexAttribPointer(this.shaderTextureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  }
}

