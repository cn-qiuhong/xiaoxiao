import core from '../../core.js';
import vertexBuffers from '../vertex-buffers.js';
import {assets} from '../../utilities.js';

export default class SimpleShader {
  constructor(vertexShaderPath, fragmentShaderPath, gl = core.gl) {

    this.compiledShader = null;
    this.shaderVertexPositionAttribute = null;
    this.pixelColor = null;
    this.modelTransform = null;
    this.viewProjTransform = null;

    let vertexShader = this.compileShader(vertexShaderPath, gl.VERTEX_SHADER);
    let fragmentShader = this.compileShader(fragmentShaderPath, gl.FRAGMENT_SHADER);
    this.compiledShader = gl.createProgram();
    gl.attachShader(this.compiledShader, vertexShader);
    gl.attachShader(this.compiledShader, fragmentShader);
    gl.linkProgram(this.compiledShader);

    if (!gl.getProgramParameter(this.compiledShader, gl.LINK_STATUS)) {
      alert('Error linking shader');
    }

    this.shaderVertexPositionAttribute = gl.getAttribLocation(this.compiledShader,
      'aSquareVertexPosition');

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers.squareVertexBuffer);

    gl.vertexAttribPointer(this.shaderVertexPositionAttribute,
      3, gl.FLOAT, false, 0, 0);

    this.pixelColor = gl.getUniformLocation(this.compiledShader, 'uPixelColor');
    this.modelTransform = gl.getUniformLocation(this.compiledShader, 'uModelTransform');
    this.viewProjTransform = gl.getUniformLocation(this.compiledShader, 'uViewProjTransform');
  }

  activeShader(pixelColor, vpMatrix, gl = core.gl) {
    gl.useProgram(this.compiledShader);
    gl.uniformMatrix4fv(this.viewProjTransform, false, vpMatrix);
    gl.enableVertexAttribArray(this.shaderVertexPositionAttribute);
    // gl.uniform4fv(this.pixelColor, pixelColor);
  }

  loadObjectTransform(modelTransform, gl = core.gl) {
    gl.uniformMatrix4fv(this.modelTransform, false, modelTransform);
  }

  compileShader(filePath, shaderType, gl = core.gl) {
    let shaderSource, compiledShader;
    shaderSource = assets[filePath];

    if (shaderSource === null) {
      alert('WARNING: no such asset: ' + filePath);
      return null;
    }

    compiledShader = gl.createShader(shaderType);
    gl.shaderSource(compiledShader, shaderSource);
    gl.compileShader(compiledShader);

    if (!gl.getShaderParameter(compiledShader, gl.COMPILE_STATUS)) {
      alert('A shader compiling error occurred: ' + gl.getShaderInfoLog(compiledShader));
    }

    return compiledShader;
  }
}

