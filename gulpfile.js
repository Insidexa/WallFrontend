var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    minifyJs = require('gulp-js-minify'),
    notify = require("gulp-notify"),
    watch = require('gulp-watch'),
    prompt = require('gulp-prompt'),
    string = require('string-to-stream'),
    source = require('vinyl-source-stream'),
    sequence = require('gulp-sequence'),
    del = require('del'),
    gulpsync = require('gulp-sync')(gulp),

    node_modules = 'node_modules/',
    components = 'components/',
    build = 'build';

gulp.task('angular-vendor', function () {
    return gulp.src([
        node_modules + 'angular/angular.min.js',
        node_modules + 'angular-route/angular-route.min.js',
        node_modules + 'satellizer/dist/satellizer.min.js',
        //node_modules + 'ng-flow/dist/ng-flow-standalone.min.js'
    ])
        .pipe(concat('angular-vendor.js'))
        .pipe(gulp.dest(build))
        .pipe(notify({message: 'Finished minifying Angular Vendor JavaScript'}));
});

gulp.task('components', function () {
    return gulp.src([
        
        components + 'auth/auth.service.js',
        components + 'auth/signin.controller.js',
        components + 'auth/signup.controller.js',

        components + 'wall/wall.controller.js',
        
        components + 'auth/auth.module.js',
        components + 'wall/wall.module.js',
        
        'web-socket.factory.js',
        
        'application.js'

    ])
        .pipe(concat('application.js'))
        //.pipe(minifyJs())
        .pipe(gulp.dest(build))
        .pipe(notify({message: 'Finished minifying app vendor JavaScript'}));
});

gulp.task('app-scripts', function () {
    gulp.src([
        build + '/angular-vendor.js',
        build + '/application.js'
    ])
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest(build))
        .pipe(notify({message: 'Create js vendor file'}));
});

gulp.task('default', function () {
    sequence(gulpsync.sync([
        'angular-vendor',
        'components',
        'app-scripts'
    ]), function () {});
});

gulp.task('watch', function () {
    gulp.watch(['**/*.js'], ['default']);
});