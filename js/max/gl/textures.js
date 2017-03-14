/**
 * @fileOverview
 * @name textures.js
 * @author TangHao <360225193@qq.com>
 * @license The MIT License
 * provides support for loading and unloading of textures (images)
 */

import core from '../core.js';
import {
  assets
}
from '../utilities.js';

export class TextureInfo {
  constructor(name, width, height, id) {
    Object.assign(this, {
      name, width, height, id
    });
  }
}

function textureLoadedHandler(textureName, image, gl = core.gl) {

  let textureID = gl.createTexture();
  // console.log('textureID-----: '+textureID);
  gl.bindTexture(gl.TEXTURE_2D, textureID);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);

  let texInfo = new TextureInfo(textureName,
    image.naturalWidth, image.naturalHeight, textureID);
  assets[textureName] = texInfo;
  // console.log('texture----: '+assets[textureName]);
}

export default class Textures {
  static load(textureName) {
    if (!assets[textureName]) {
      assets.load([textureName]).then(() => {
        textureLoadedHandler(textureName, assets[textureName]);
      });
    } else if (!(assets[textureName] instanceof TextureInfo)) {
      textureLoadedHandler(textureName, assets[textureName]);
    }
  }

  static unload(textureName, gl = core.gl) {
    let texInfo = assets[textureName];
    gl.deleteTexture(texInfo.id);
    delete assets[textureName];
  }

  static activateTexture(textureName, gl = core.gl) {
    let texInfo = assets[textureName];

    if(!texInfo || !texInfo.id || !(texInfo.id instanceof WebGLTexture))  return;

    // Binds our texture reference to the current webGL texture functionality
    gl.bindTexture(gl.TEXTURE_2D, texInfo.id);
    
    // To prevent texture wrappings
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Handles how magnification and minimization filters will work.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    // For pixel-graphics where you want the texture to look "sharp" do the following:
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); 
  }

  static deactivateTexture(gl=core.gl) {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  static getTextureInfo(textureName) {
    if(assets[textureName] && (assets[textureName] instanceof TextureInfo)) {
      return assets[textureName];
    }
    alert('can not find texture info: '+assets[textureName]); 
    return null;
  }
}

