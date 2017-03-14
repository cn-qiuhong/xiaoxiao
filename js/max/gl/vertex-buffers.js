import core from '../core.js';
let verticesOfSquare = new Float32Array([
  0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
  0.5, -0.5, 0.0,
    -0.5, -0.5, 0.0
]);

let textureCoordinates = new Float32Array([
  1.0, 1.0,
  0.0, 1.0,
  1.0, 0.0,
  0.0, 0.0
]);

let vertexBuffers = {
  init: function(gl = core.gl) {
    this.squareVertexBuffer = gl.createBuffer();
    this.textureCoordBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesOfSquare, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
  }
};

export default vertexBuffers;
