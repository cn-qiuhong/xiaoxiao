export default class Camera {
  constructor(wcCenter, wcWidth, viewportArray) {
    this.wcCenter = vec2.fromValues(wcCenter[0], wcCenter[1]);
    this.wcWidth = wcWidth;
    this.viewport = viewportArray; // [x, y, width, height]
    this.nearPlane = 0;
    this.farPlane = 1000;

    this.viewMatrix = mat4.create();
    this.projMatrix = mat4.create();
    this.vpMatrix = mat4.create();

    this.bgColor = [0.8, 0.8, 0.8, 1];
  }

  setWCCenter(x, y) {
    this.wcCenter[0] = x;
    this.wcCenter[1] = y;
  }

  setupViewProjection(gl) {
    //  set up the viewport area on canvas to drawn
    gl.viewport(this.viewport[0],
                this.viewport[1],
                this.viewport[2],
                this.viewport[3]);
    
    // set up the corresponding scissor area to limit the clear area
    gl.scissor(this.viewport[0],
               this.viewport[1],
               this.viewport[2],
               this.viewport[3]);

    // set the color to be clear to black
    gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], this.bgColor[3]);

    // enable the scissor area, clear, and then disable the scissor area
    gl.enable(gl.SCISSOR_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);

    // define the view matix
    mat4.lookAt(this.viewMatrix,
                [this.wcCenter[0], this.wcCenter[1], 10],  // WC center
                [this.wcCenter[0], this.wcCenter[1], 0],
                [0, 1, 0]);

    // define the projection matrix
    let halfWCWidth = this.wcWidth >> 1;
    let halfWCHeight = halfWCWidth * this.viewport[3] / this.viewport[2];

    mat4.ortho(this.projMatrix,
               -halfWCWidth,    // distant to left of WC
               halfWCWidth,     // distant to right of WC
               -halfWCHeight,   // distant to bottom of WC
               halfWCHeight,    // distant to top of WC
               this.nearPlane,  // z-distant to near plane
               this.farPlane);  // z-distant to far plane

    // concatenate view and project matrices
    mat4.multiply(this.vpMatrix, this.projMatrix, this.viewMatrix);
  } 
}
