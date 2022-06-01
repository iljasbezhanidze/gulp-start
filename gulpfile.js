const importLibs = [
    'node_modules/@fancyapps/ui/dist/fancybox.css',
    'node_modules/swiper/swiper-bundle.css'
]

const { src, dest, watch, series, parallel } = require('gulp'),
    browserSync = require('browser-sync').create(),
    fileInclude = require('gulp-file-include'),
    sass = require('gulp-dart-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    // purgecss = require('gulp-purgecss'),
    mediaQueries = require('gulp-group-css-media-queries'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    ttf2woff2 = require('gulp-ttftowoff2'),
    del = require('del')

    //DEV TASKS------------------------------
const html = () => {
    return src('./src/*.html')
        .pipe(plumber({
            errorHandler: notify.onError()
        }))
        .pipe(fileInclude())
        .pipe(dest('./dist'))
        .pipe(browserSync.stream());
    }

const styles = () => {
    return src([
            './src/scss/base/main.{scss, saas}',
            './src/scss/**.{scss, sass, css}',
            './src/scss/blocks/**.{scss, sass, css}',
            ...importLibs
        ])

        .pipe(sourcemaps.init())
        .pipe(sass().on('error', notify.onError()))
        .pipe(concat('main.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions']
        }))
        .pipe(mediaQueries())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/css'))
        .pipe(browserSync.stream());
}

const scripts = () => {
    return src('./src/js/main.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./dist/js'))
        .pipe(browserSync.stream());
}

const images = () => {
    return src('./src/img/**.*')
        .pipe(dest('./dist/img'))
}

const fonts = () => {
    return src('./src/fonts/**.ttf')
        .pipe(dest('./dist/fonts/'))
}

const clear = () => del('./dist')


const server = () => browserSync.init({
    server: {
        baseDir: 'dist'
    }
})


const watcher = () => {
    watch('./src/**/*.html', html)
    watch(['./src/**/*.css', './src/**/*.scss', './src/**/*.sass'], styles)
    watch('./src/js/**/**.js', scripts)
    watch('./src/img/**.*', images)
    watch('.src/fonts/**.ttf', fonts)
};

exports.html = html;
exports.watch = watch;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;


exports.default = series(
    clear,
    html,
    fonts,
    styles,
    scripts,
    images,
    parallel(watcher, server)
);


//BUILD TASKS--------------------------
const clearBuild = () => del('./build')

    const htmlBuild = () => {
        return src('./dist/*.html')
            .pipe(dest('./build'));
    }

const stylesBuild = () => {
    return src(
            './dist/css/main.css')
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(dest('./build/css'))
}

const fontsBuild = () => {
    return src('./dist/fonts/**.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('./build/fonts/'))
}

exports.build = series(
    clearBuild,
    htmlBuild,
    stylesBuild,
    fontsBuild
)