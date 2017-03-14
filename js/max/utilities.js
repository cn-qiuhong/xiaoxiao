export let assets = {
  to_load: 0,
  loaded: 0,
  root: './assets/',

  imageExtensions: ['png', 'jpg', 'gif'],
  fontExtensions: ['ttf', 'otf', 'ttc', 'woff'],
  textExtensions: ['json', 'xml', 'glsl'],
  audioExtensions: ['mp3', 'ogg', 'wav', 'webm'],

  load: function (sources) {
    return new Promise((resolve) => {
      let loadHandler = () => {
        this.loaded += 1;
        console.log("[ " + this.loaded + " / " + this.to_load + " ]");
        if (this.to_load == this.loaded) {
          this.to_load = 0;
          this.loaded = 0;
          console.log('Assets finished loading');
          resolve();
        }
      };

      console.log('Loading assets...');
      this.to_load = sources.length;
      if (this.to_load < 1) {
        console.log('no assets need to load.');
        resolve();
      } else {
        sources.forEach((source) => {
          let extension = source.split('.').pop();
          if (this.imageExtensions.indexOf(extension) !== -1) {
            this.loadImage(source, loadHandler);
          } else if (this.fontExtensions.indexOf(extension) !== -1) {
            this.loadFont(source, loadHandler);
          } else if (this.textExtensions.indexOf(extension) !== -1) {
            if (extension === 'json')
              this.loadJson(source, loadHandler);
            else if (extension === 'xml')
              this.loadXML(source, loadHandler);
            else
              this.loadText(source, loadHandler);
          } else if (this.audioExtensions.indexOf(extension) !== -1) {
            this.loadSound(source, loadHandler);
          } else {
            console.log('File type not recongnized: ' + source);
          }
        });
      }
    });
  },

  loadImage: function (source, loadHandler) {
    let image = new Image();
    image.addEventListener('load', loadHandler, false);
    this[source] = image;
    image.src = this.root + source;
  },

  loadFont: function (source, loadHandler) {
    let font_family = source.split('/').pop().split('.')[0];
    let new_style = document.createElement('style');
    let font_face = "@font-face {font-family: '" + font_family + "'; src: url('" + this.root + source + "');}";
    new_style.appendChild(document.createTextNode(font_face));
    document.head.appendChild(new_style);
    loadHandler();
  },

  loadJson: function (source, loadHandler) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', this.root + source, true);
    xhr.responseType = 'text';
    xhr.onload = (event) => {
      if (xhr.status === 200) {
        let file = JSON.parse(xhr.responseText);
        file.name = source;
        this[file.name] = file;
        if (file.frames) {
          this.createTilesetFrames(file, source, loadHandler);
        } else {
          loadHandler();
        }
      }
    };
    xhr.send();
  },

  loadXML: function (source, loadHandler) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', this.root + source, true);
    xhr.responseType = 'text';
    xhr.onload = (event) => {
      if (xhr.status === 200) {
        let parser = new DOMParser();
        let file = parser.parseFromString(xhr.responseText, 'text/xml');
        file.name = source;
        this[file.name] = file;
        loadHandler();
      }
    };
    xhr.send();
  },

  loadText: function (source, loadHandler) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', this.root + source, true);
    xhr.responseType = 'text';
    xhr.onload = (event) => {
      if (xhr.status === 200) {
        let file = xhr.responseText;
        this[source] = file;
        loadHandler();
      }
    };
    xhr.send();
  },

  createTilesetFrames: function (file, source, loadHandler) {
    let base_url = source.replace(/[^\/]*$/, "");
    let image_source = base_url + file.meta.image;
    let image = new Image();
    let imageLoadHandler = () => {
      this[image_source] = image;
      Object.keys(file.frames).forEach((frame) => {
        let x = this;
        this[frame] = file.frames[frame];
        this[frame].source = image;
      });
      loadHandler();
    };
    image.addEventListener('load', imageLoadHandler, false);
    image.src = this.root + image_source;
  },

  loadSound: function (source, loadHandler) {
    let sound = makeSound(this.root + source, loadHandler);
    sound.name = source;
    this[sound.name] = sound;
  }
};

export function addToArray(...spritesToAdd) {
  spritesToAdd.forEach(sprite=> {
    let index = this.indexOf(sprite);
    if (index < 0) this.push(sprite);
  });
}

export function angle(sprite1, sprite2) {
  return Math.atan2(
    sprite2.centerY - sprite1.centerY,
    sprite2.centerX - sprite1.centerX
  );
}

export function contain(sprite, bounds, bounce = false, extra = undefined) {
  let x = bounds.x,
    y = bounds.y,
    width = bounds.width,
    height = bounds.height;

  let collision = false;

  // left
  let left = x + sprite._offsetX,
    top = y + sprite._offsetX,
    right = width - (sprite.width - sprite._offsetX),
    bottom = height - (sprite.height - sprite._offsetY);

  if (sprite.x < left) {
    if (bounce) sprite.vx *= -1;
    if (sprite.mass) sprite.vx /= sprite.mass;
    sprite.x = left;
    collision = 'letf';
  }
  // top
  if (sprite.y < top) {
    if (bounce) sprite.vy *= -1;
    if (sprite.mass) sprite.vy /= sprite.mass;
    sprite.y = top;
    collision = 'top';
  }
  // right
  if (sprite.x > right) {
    if (bounce) sprite.vx *= -1;
    if (sprite.mass) sprite.vx /= sprite.mass;
    sprite.x = right;
    collision = 'right';
  }
  // bottom
  if (sprite.y > bottom) {
    if (bounce) sprite.vy *= -1;
    if (sprite.mass) sprite.vy /= sprite.mass;
    sprite.y = bottom;
    collision = 'bottom';
  }

  if (collision && extra) extra(collision);
  return collision;
}

export function distance(sprite1, sprite2) {
  let vx = sprite2.centerX - sprite1.centerX,
    vy = sprite2.centerY - sprite1.centerY;
  return Math.sqrt(vx * vx + vy * vy);
}

export function followConstant(follower, leader, speed) {
  let vx = leader.centerX - follower.centerX,
    vy = leader.centerY - follower.centerY;
  distance = Math.sqrt(vx * vx + vy * vy);

  if (distance >= speed) {
    follower.x += (vx / distance) * speed;
    follower.y += (vy / distance) * speed;
  }
}

export function followEase(follower, leader, speed) {
  let vx = leader.centerX - follower.centerX,
    vy = leader.centerY - follower.centerY;
  distance = Math.sqrt(vx * vx + vy * vy);

  if (distance > 0) {
    follower.x += vx * speed;
    follower.y += vy * speed;
  }
}

export function outsideBounds(sprite, bounds, extra = undefined) {
  let {x,y,width,height} = bounds;
  let collision;
  if (sprite.x < x - sprite.width) collision = 'left';
  if (sprite.y < y - sprite.height) collision = 'top';
  if (sprite.x > width) collision = 'right';
  if (sprite.y > height) collision = 'bottom';

  if (collision && extra) extra(collision);

  return collision;
}

export function rotateSprite(rotatingSprite, centerSprite, distance, angle) {
  rotatingSprite.x =
    centerSprite.centerX - rotatingSprite.parent.x + rotatingSprite._offsetX
    + (distance * Math.cos(angle))
    - rotatingSprite.halfWidth;

  rotatingSprite.y =
    centerSprite.centerY - rotatingSprite.parent.y + rotatingSprite._offsetY
    + (distance * Math.sin(angle))
    - rotatingSprite.halfHeight;
}

export function rotatePoint(pointX, pointY, distanceX, distanceY, angle) {
  let point = {};
  point.x = pointX + Math.cos(angle) * distanceX;
  point.y = pointY + Math.sin(angle) * distanceY;
  return point;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

export function removeFromArray(...spritesToRemove) {
  spritesToRemove.forEach(sprite => {
    let index = this.indexOf(sprite);
    if (index >= 0) this.splice(index, 1);
  });
}

export function shoot(shooter, angle, offsetFromCenter, bulletSpeed, bulletArray, bulletSprite) {
  let bullet = bulletSprite();
  bullet.x = shooter.centerX // - bullet.halfWidth
    + (offsetFromCenter * Math.cos(angle));
  bullet.y = shooter.centerY // - bullet.halfHeight
    + (offsetFromCenter * Math.sin(angle));

  bullet.vx = Math.cos(angle) * bulletSpeed;
  bullet.vy = Math.sin(angle) * bulletSpeed;

  bulletArray.push(bullet);
}