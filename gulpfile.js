/* Modules */
// General
let gulp = require('gulp')
let rename = require('gulp-rename')
// HTML
let pug = require('gulp-pug')
let prettify = require('gulp-prettify')
// CSS
let sass = require('gulp-sass')
let autoprefixer = require('gulp-autoprefixer')
let cleanCSS = require('gulp-clean-css') // minifies CSS
// JS
let beautify = require('gulp-beautify')
let uglify = require('gulp-uglify')
//Server
let connect = require('gulp-connect')

/* Connect to server */
gulp.task('connect', function() {
    connect.server({livereload: true})
})

/* Minify Library Files */
gulp.task('library', function() {
    gulp.src('src/library/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('src/library'))
    gulp.src('src/library/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('src/library'))
})

/* Formats Gulpfile */
gulp.task('gulpfile', function() {
    gulp.src('gulpfile.js')
        .pipe(beautify())
        .pipe(gulp.dest('./'))

})

/* HTML */
gulp.task('pug', function() {
    // Converts pug to formatted HTML
    function HTMLify(src, dest) {
        gulp.src(src)
            .pipe(pug())
            .pipe(prettify({
                indent_size: 4
            }))
            .pipe(gulp.dest(dest))
            .pipe(connect.reload())
    }
    // Convert these pug files to HTML
    HTMLify('*.pug', './')
})

/* CSS */
gulp.task('scss', function() {
    // Adds `.min` the to filename
    function addMin(path) {
        path.basename += '.min'
    }
    // Converts SCSS to CSS
    gulp.src('src/scss/*.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            indentWidth: 4
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(cleanCSS())
        .pipe(rename(addMin))
        .pipe(gulp.dest('src/min-css'))
        .pipe(connect.reload())
    // Converts Sass to CSS
    gulp.src('src/scss/*.sass')
        .pipe(sass({
            outputStyle: 'expanded',
            indentWidth: 4
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(cleanCSS())
        .pipe(rename(addMin))
        .pipe(gulp.dest('src/min-css'))
        .pipe(connect.reload())
})

/* JS */
gulp.task('js', function() {
    // Formats JS
    gulp.src('src/js/*.js')
        .pipe(beautify())
        .pipe(gulp.dest('src/js'))
        .pipe(connect.reload())
})
gulp.task('reloadJs', function() {
    // Formats JS
    gulp.src('src/js/*.js')
        .pipe(connect.reload())
})

/* Does All Gulp Tasks */
gulp.task('watch', function() {
    gulp.watch(['*.pug'], ['pug'])
    gulp.watch(['src/scss/*.scss', 'src/scss/*.sass'], ['scss'])
    gulp.watch('src/js/*.js', ['reloadJs'])
})

gulp.task('default', ['connect', 'watch'])
