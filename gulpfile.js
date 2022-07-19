const gulp = require('gulp');
const concat = require('gulp-concat'); 
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const cssimport = require("gulp-cssimport");
const autoprefixer = require('gulp-autoprefixer');
const fileinclude = require('gulp-file-include');
const minify = require('gulp-minifier');
const babel = require('gulp-babel');
const webp = require('gulp-webp');
const runSequence = require('gulp4-run-sequence');

const paths = {
  html: {
    src: 'src/pages/*.html',
    dist: './build/'
  },
  js: {
    src: 'src/js/*.js',
    dist: 'build/assets/js'
  },
  css: {
    src: 'src/sass/main.scss',
    dist: 'build/assets/css',
    scss: 'src/sass/**/*.scss'
  },
  images: {
    src: 'src/images/**/*.{tif,tiff,bmp,jpg,jpeg,gif,png}',
    dist: 'build/assets/images',
    svg : {
      src : 'src/images/**/*.svg',
      dist: 'build/assets/images'
    }
  }
}

function htmlTask(){
  return gulp
    .src(paths.html.src)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true
    }))
    .pipe(gulp.dest(paths.html.dist));
}

function scssTask() {
  return gulp
    .src(paths.css.src)
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(cssimport())
    .pipe(minify({
        minify: true,
        minifyCSS: true
    }))
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest(paths.css.dist))
    .pipe(browserSync.stream());
}

function jsTask() {
  return gulp
    .src(paths.js.src)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('main.min.js'))
    .pipe(minify({
      minify: true,
      minifyJS: {
          sourceMap: true
      },
    }))
    .pipe(gulp.dest(paths.js.dist))
    .pipe(browserSync.stream());
}

function webpTask() {
  return gulp
    .src(paths.images.src)
    .pipe(webp())
    .pipe(gulp.dest(paths.images.dist))
}

function svgTask() {
  return gulp
    .src(paths.images.svg.src)
    .pipe(gulp.dest(paths.images.svg.dist))
}


function build(callback) {
  return runSequence(
    'svgTask',
    'webpTask',
    'scssTask',
    'jsTask',
    'htmlTask',
    callback
  )
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    });
    gulp.watch(paths.images.svg.src, svgTask);
    gulp.watch(paths.images.src, webpTask);
    gulp.watch(paths.css.scss, scssTask);
    gulp.watch(paths.js.src, jsTask);
    gulp.watch(paths.html.src).on('change', htmlTask);
    gulp.watch(paths.html.src).on('change', browserSync.reload);
}


exports.svgTask = svgTask;
exports.webpTask = webpTask;
exports.scssTask = scssTask;
exports.jsTask = jsTask;
exports.htmlTask = htmlTask;
exports.build = build;
exports.watch = watch;