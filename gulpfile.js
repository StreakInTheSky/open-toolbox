// Load plugins gulp gulp-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-uglify gulp-imagemin gulp-rename gulp-clean gulp-concat gulp-notify gulp-cache gulp-server-livereload
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    // jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    server = require('gulp-server-livereload');

// Styles
gulp.task('styles', function() {
  return gulp.src('src/css/style.scss')
    .pipe(sass({ style: 'expanded', }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('public/css'))
    // .pipe(rename({ suffix: '.min' }))
    // .pipe(minifycss())
    // .pipe(gulp.dest('public/css'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/js/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js'))
    // .pipe(rename({ suffix: '.min' }))
    // .pipe(uglify())
    // .pipe(gulp.dest('html/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('public/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function() {
  return gulp.src(['public/css', 'public/js', 'public/image'], {read: false})
    .pipe(clean());
});

// Server
gulp.task('webserver', function() {
  gulp.src('./public/')
    .pipe(server({
      livereload: true,
      directoryListing: false,
      open: true
    }));
	gulp.run('watch')
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.run(['styles', 'scripts', 'images']);
});

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('src/css/**/*.scss', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.run('styles');
  });

  // Watch .js files
  gulp.watch('src/js/**/*.js', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.run('scripts');
  });

  // Watch image files
  gulp.watch('src/images/**/*', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    gulp.run('images');
  });

});
