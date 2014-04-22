'use strict';

var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('lint', function () {
  return gulp.src(['src/*.js', 'test/*.js', 'gulpfile.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function (cb) {
  require('test-setup');
  gulp.src('src/*.js')
    .pipe(plugins.istanbul())
    .on('end', function () {
      gulp.src('test/*.js')
        .pipe(plugins.mocha())
        .pipe(plugins.istanbul.writeReports())
        .on('end', cb);
    });
});