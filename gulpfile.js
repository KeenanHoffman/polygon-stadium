var gulp = require('gulp');
var htmlMin = require('gulp-htmlmin');
var cssMin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');

gulp.task('default', function() {
  runSequence(['build:html', 'build:css', 'build:js', 'build:images', 'build:lib']);
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
  return gulp.src('src/**/*.css')
    .pipe(watch('src/**/*.css'))
    .pipe(cssMin())
    .pipe(gulp.dest('dist'));
});
gulp.task('build:js', function() {
  return gulp.src('src/js/*.js')
    .pipe(watch('src/js/*.js'))
    .pipe(babel({
			presets: ['es2015']
		}))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});
gulp.task('build:images', function() {
  return gulp.src('src/**/*.png')
    .pipe(watch('src/**/*.png'))
    .pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
    .pipe(gulp.dest('dist'));
});
gulp.task('build:lib', function() {
  return gulp.src('src/lib/*.js')
    .pipe(watch('src/lib/*.js'))
    .pipe(gulp.dest('dist/lib'));
});
//babel

//ongoing dev tool that does this when I change a file

//build our code
//build our sass
//minify our sass
//minify our html: done
//convert jsx to js
//bundle our jsx into a single file
//minify our js
//clean our build

//generate our documentation
//deploy our code to amazon s3

//unit tests
