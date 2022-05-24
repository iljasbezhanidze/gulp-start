const { src, dest, watch, series, parallel } = require('gulp');
const browserSync = require('browser-sync').create();

//плагіны
const fileInclude = require('gulp-file-include');
const sass = require('gulp-dart-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const concat = require('gulp-concat');
const mediaQueries = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

//обробка html
const html = () => {
    return src('./src/*.html')
        .pipe(plumber({
            errorHandler: notify.onError()
        }))
        .pipe(fileInclude())
        .pipe(dest('./dist'))
        .pipe(browserSync.stream());
}

//обробка стилів
const styles = () => {
    return src('./src/scss/main.{scss, saas}')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', notify.onError()))
        .pipe(concat('main.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions']
        }))
        .pipe(mediaQueries())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/css'))
        .pipe(browserSync.stream());
}


//скріпты
const scripts = () => {
    return src('./src/js/main.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/js'))
        .pipe(browserSync.stream());
}

//переносим зображення в dist
const images = () => {
    return src('./src/img/**.*')
        .pipe(dest('./dist/img'))
}

//перезапис папки dist при перезавантаженні
const clear = () => {
    return del('./dist')
}

//live сервер
const server = () => {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    })
}

//спостереження за змінами у файлах
const watcher = () => {
    watch('./src/**/*.html', html)
    watch(['./src/**/*.scss', './src/**/*.sass', './src/**/*.css'], styles)
    watch('./src/js/*.js', scripts)
    watch('./src/img/**.*', images)
}

//таски
exports.html = html;
exports.watch = watch;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;

//live сбірка при змінах | черга запуску тасків
exports.default = series(
    clear,
    html,
    styles,
    scripts,
    images,
    parallel(watcher, server)
);