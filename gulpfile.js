var gulp = require('gulp');
var notify = require('gulp-notify');
var util = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var source_maps = require('gulp-sourcemaps');
var watchify = require('watchify');
var lodash = require('lodash');
var browser_sync = require('browser-sync');

// var fs = require('fs');

var src = 'js/main.js';
var index = 'index.html';

var custom_opts = {entries:[src], debug: true};
var opts = lodash.assign({}, watchify.args, custom_opts);
var bundler = watchify(browserify(opts));

bundler.transform('babelify', {
  presets: ["es2015"],
  sourceMaps: "both"              // true both inline
});
// bundler.transform(babelify);

bundler.on('update',function() {
  util.log('bundling...');
  _6to5();
});

function handlerErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Build Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

// bundler.on('error',
//   notify.onError()
// );

bundler.on('log',util.log);

function _6to5() {
  return bundler.bundle()
    .on('error',handlerErrors)
    .pipe(source('output.js'))
    .pipe(buffer())
    .pipe(source_maps.init({loadMaps:true}))
    .pipe(uglify())
    .pipe(rename('bundle.js'))
    //.pipe(source_maps.write('./'))//关闭后无法查看源码
    .pipe(gulp.dest('./'))
    .pipe(browser_sync.reload({stream:true}));
}

gulp.task('6to5', function() {  
  return _6to5();
});

gulp.task('browser-sync',function() {
  browser_sync({
    files:[index,'assets/**','lib/**'],
    server: {
      baseDir: './',
      index: index
    },
    port:3000,
    ui: {port:8090},
    // logLevel:"debug",
    // browser:['firefox']
    browser:['chrome']
  });
});


gulp.task('default', ['6to5','browser-sync']);




