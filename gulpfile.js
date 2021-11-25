const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const { src, dest, watch } = gulp;

const scssFiles = ['**/*.scss', '!node_modules/**'];

const compileSCSS = function() {
    // 所有文件夹下得scss文件,排除components目录,排除node_modules目录
    return src(scssFiles)
        .pipe(sass().on('error', sass.logError))
        .pipe(rename({extname: '.wxss'}))
        .pipe(dest('./', {overwrite: true})); // 编译出来的文件放回scss文件所在目录
};

module.exports.default = function() {
    watch(scssFiles, compileSCSS)
};