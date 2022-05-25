const { src, dest, watch, series, parallel } = require('gulp'),
    browserSync = require('browser-sync').create(),

//плагіны
    fileInclude  = require('gulp-file-include'),
    sass         = require('gulp-dart-sass'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify'),
    concat       = require('gulp-concat'),
    mediaQueries = require('gulp-group-css-media-queries'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps   = require('gulp-sourcemaps'),
    ttf2woff2    = require('gulp-ttftowoff2'),
    cleanCSS = require('gulp-clean-css'),
    del          = require('del'),

//обробка html
    html = () => {
        return src('./src/*.html')
            .pipe(plumber({
                errorHandler: notify.onError()
            }))
            .pipe(fileInclude())
            .pipe(dest('./dist'))
            .pipe(browserSync.stream());
    },

//обробка стилів
    styles = () => {
        return src('./src/scss/main.{scss, saas}')
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', notify.onError()))
            .pipe(concat('main.min.css'))
            .pipe(autoprefixer({
                overrideBrowserslist: ['last 5 versions']
            }))
            .pipe(mediaQueries())
            .pipe(cleanCSS({level: 2}))
            .pipe(sourcemaps.write('.'))
            .pipe(dest('./dist/css'))
            .pipe(browserSync.stream());
    },


//скріпты
    scripts = () => {
        return src('./src/js/main.js')
            .pipe(sourcemaps.init())
            .pipe(concat('main.min.js'))
            .pipe(sourcemaps.write('.'))
            .pipe(dest('./dist/js'))
            .pipe(browserSync.stream());
    },

//переносим зображення в dist
    images = () => {
        return src('./src/img/**.*')
            .pipe(dest('./dist/img'))
    },

// робота із шрифтами
    fonts = () => {
        return src('./src/fonts/**.ttf')
            .pipe(ttf2woff2())
            .pipe(dest('./dist/fonts/'))
    },

//перезапис папки dist при перезавантаженні
    clear = () => del('./dist'),

//live сервер
    server = () => browserSync.init({server: {baseDir: 'dist'}}),

//спостереження за змінами у файлах
    watcher = () => {
        watch('./src/**/*.html', html)
        watch(['./src/**/*.scss', './src/**/*.sass', './src/**/*.css'], styles)
        watch('./src/js/*.js', scripts)
        watch('./src/img/**.*', images)
        watch('.src/fonts/**.ttf', fonts)
    };

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
    fonts,
    styles,
    scripts,
    images,
    parallel(watcher, server)
);