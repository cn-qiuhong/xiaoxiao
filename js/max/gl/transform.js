export default class Transform {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width  = 1;
    this.height = 1;
    this.pivotX = 0;
    this.pivotY = 0;
    this.rotationInRad = 0.0;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  incX(delta = 1) {
    this.x += delta;
  }

  incY(delta = 1) {
    this.y += delta;
  }

  incWidth(delta = 1) {
    this.width += delta;
  }

  incHeight(delta = 1) {
    this.height += delta;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  incSize(delta) {
    this.incWidth(delta);
    this.incHeight(delta);
  }

  setRotationInRad(rotationInRadians) {
    this.rotationInRad = rotationInRadians;
    while (this.rotationInRad > (2 * Math.PI)) {
      this.rotationInRad -= (2 * Math.PI);
    }
  }
  getRotationInRad() {
    return this.rotationInRad;
  }
  incRotationByRad(delta) {
    this.setRotationInRad(this.rotationInRad + delta);
  }

  setRotationInDegree(rotationInDegree) {
    this.setRotationInRad(rotationInDegree * Math.PI / 180.0);
  }
  getRotationInDegree() {
    return this.rotationInRad * 180 / Math.PI;
  }

  incRotationByDegree(delta) {
    this.incRotationByRad(delta * Math.PI / 180.0);
  }

  getXfrom() {
    let matrix = mat4.create();

    mat4.translate(matrix, matrix, [this.x, this.y, 0]);
    mat4.rotateZ(matrix, matrix, -this.rotationInRad);
    mat4.translate(matrix, matrix, [-this.pivotX, -this.pivotY, 0]);
    mat4.scale(matrix, matrix, [this.width, this.height, 1]);

    return matrix;
  }
}

