'use strict';

var gulp = require('gulp');
var htmlMin = require('gulp-htmlmin');
var cssMin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var ngAnnotate = require('gulp-ng-annotate');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');

gulp.task('default', function() {
  runSequence(['build:html', 'build:css', 'build:images', 'build:lib', 'build:bower', 'build:angular', 'build:views']);
});

gulp.task('build:html', function() {
  return gulp.src('src/*.html')
    .pipe(watch('src/*.html'))
    .pipe(htmlMin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'));
});
gulp.task('build:css', function() {
  return gulp.src('src/css/*.css')
    .pipe(watch('src/css/*.css'))
    .pipe(cssMin())
    .pipe(gulp.dest('dist/css'));
});
gulp.task('build:images', function() {
  return gulp.src('src/images/*.png')
    .pipe(watch('src/images/*.png'))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('dist/images'));
});
gulp.task('build:lib', function() {
  return gulp.src('src/lib/*.js')
    .pipe(watch('src/lib/*.js'))
    .pipe(gulp.dest('dist/lib'));
});
gulp.task('build:bower', function() {
  return gulp.src('src/bower_components/**/*')
    .pipe(watch('src/bower_components/**/*'))
    .pipe(gulp.dest('dist/lib'));
});
gulp.task('build:angular', function() {
  return gulp.src('src/angular/js/*')
    .pipe(watch('src/angular/js/*'))
    .pipe(ngAnnotate())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});
gulp.task('build:views', function() {
  return gulp.src('src/angular/views/*')
    .pipe(watch('src/angular/views/*'))
    .pipe(gulp.dest('dist/views'));
});
