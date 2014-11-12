/*jshint node: true */
"use strict";

var bower = require('bower');

var gulp = require('gulp'),
  listing = require('gulp-task-listing'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  minifyCss = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  jshint = require('gulp-jshint'),
  karma = require('gulp-karma'),
  protractor = require("gulp-protractor").protractor,
  livereload = require('gulp-livereload');

var paths = {
  destination: './www',
  sass: [
    './scss/*.scss',
    './scss/**/*.scss'
  ],
  js: [
    'www/js/**/*.js'
  ],
  karmaDeps: [
    'www/lib/angular/angular.js',
    'www/lib/angular-animate/angular-animate.js',
    'www/lib/angular-sanitize/angular-sanitize.js',
    'www/lib/angular-ui-router/release/angular-ui-router.js',
    'www/lib/angular-mocks/angular-mocks.js',
    'www/lib/ng-cordova/dist/ng-cordova.js',
    'www/lib/ionic/js/ionic.bundle.js',
    'www/lib/jquery/dist/jquery.js',
    'www/lib/lodash/dist/lodash.js',
    'www/lib/firebase/firebase.js',
    'www/lib/angularfire/dist/angularfire.js',
    'www/js/**/*.js',
    'test/unit/**/*.js'
  ]
};

gulp.task('init', function (done) {
  var spawn = require('child_process').spawn;

  var finishEventCount = 0, TOTAL_FINISH_EVENTS = 3;
  var setupCordova = spawn('./setup_cordova.sh'),
      bowerInstall = spawn('./node_modules/.bin/bower', ['install', '-q']),
      webDriverInstall = spawn('./node_modules/.bin/webdriver-manager', ['update']);

  var consolePrintData = function (data) {
    console.log(data.toString());
  }, consoleErrorData = function (data) {
    console.log('ERROR: ' + data.toString());
  }, finishEvent = function (code) {
    console.log("Finished with the code: " + code);
    finishEventCount += 1;
    if (finishEventCount === TOTAL_FINISH_EVENTS) {
      done();
    }
  };

  setupCordova.on('exit', finishEvent);
  bowerInstall.on('exit', finishEvent);
  webDriverInstall.on('exit', finishEvent);

  setupCordova.stdout.on('data', consolePrintData);
  setupCordova.stderr.on('data', consoleErrorData);
  bowerInstall.stdout.on('data', consolePrintData);
  bowerInstall.stderr.on('data', consoleErrorData);
  webDriverInstall.stdout.on('data', consolePrintData);
  webDriverInstall.stderr.on('data', consoleErrorData);
});

gulp.task('lint', function (done) {
  gulp.src(paths.js)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .on('end', done);
});

gulp.task('test-e2e', function (done) {
  var connect = require('connect'),
      server = connect();

  server.use(connect.static(paths.destination))
        .listen(process.env.PORT || 8080, function () {
          gulp.src(["./test/e2e/**/*.js"])
              .pipe(protractor({
                configFile: "./test/protractor.config.js",
                args: ['--baseUrl', 'http://127.0.0.1:8080']
              }))
              .on('error', function (e) {
                throw e;
              })
              .on('end', done);
        });


});

gulp.task('test-unit', function (done) {
  // Be sure to return the stream
  gulp.src(paths.karmaDeps.concat(paths.js))
      .pipe(karma({ configFile: 'karma.conf.js', action: 'run' }))
      .on('error', function (err) { throw err; })
      .on('end', done);
});

gulp.task('sass', function (done) {
  gulp.src('./scss/ionic.app.scss')
      .pipe(sass())
      .pipe(gulp.dest('./www/css/'))
      .pipe(minifyCss({
        keepSpecialComments: 0
      }))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest('./www/css/'))
      .on('end', done);
});

gulp.task('serve', function (done) {
  var connect = require('connect'),
      server = connect();
  server.use(connect.static(paths.destination))
        .listen(process.env.PORT || 8080, done);
});

gulp.task('watch-lint', function (done) {
  gulp.watch(paths.js, ['lint'])
      .on('end', done);
});

gulp.task('watch-sass', function (done) {
  gulp.watch(paths.sass, ['sass'])
      .on('end', done);
});

gulp.task('watch-karma', function (done) {
  gulp.src(paths.karmaDeps.concat(paths.js))
      .pipe(karma({ configFile: 'karma.conf.js', action: 'watch' }))
      .on('end', done);
});

gulp.task('watch-files', ['serve'], function (done) {
  var server = livereload();
  gulp.watch(paths.destination + '/**')
      .on('change', function (file) { server.changed(file.path); })
      .on('end', done);
});

gulp.task('emulate-ios', ['sass'], function (done) {
  var spawn = require('child_process').spawn;

  var ionicEmulateIos = spawn('ionic', ['emulate', 'ios']);
  ionicEmulateIos.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  ionicEmulateIos.stderr.on('data', function (data) {
    console.log('ERROR: ' + data.toString());
  });

  ionicEmulateIos.on('exit', function (code) {
    console.log('ionic exited with code ' + code);

    var tailingLog = spawn('tail', ['-f', './platforms/ios/cordova/console.log']);
    tailingLog.stdout.on('data', function (data) {
      console.log(data.toString());
    });
    tailingLog.stderr.on('data', function (data) {
      console.log('ERROR: ' + data.toString());
    });
    tailingLog.on('exit', done);
  });
});

gulp.task('run-ios', ['sass'], function (done) {
  var spawn = require('child_process').spawn;

  var ionicRunIos = spawn('ionic', ['run', 'ios']);
  ionicRunIos.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  ionicRunIos.stderr.on('data', function (data) {
    console.log('ERROR: ' + data.toString());
  });

  ionicRunIos.on('exit', function (code) {
    console.log('ionic exited with code ' + code);
    done();
  });
});

gulp.task('help', listing);

gulp.task('test', ['lint', 'test-unit', 'test-e2e']);
gulp.task('emulate', ['emulate-ios']);
gulp.task('run', ['run-ios']);

gulp.task('watch-test', ['watch-lint', 'watch-sass', 'watch-karma', 'watch-files']);
gulp.task('watch-serve', ['watch-sass', 'watch-files', 'serve']);

gulp.task('default', ['watch-serve']);
