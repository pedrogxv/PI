const gulp, { series } = require('gulp');
const cleanCSS = require('gulp-clean-css')

const mergeCss = (cb) => {

	gulp.src('../styles/*.css')
    	.pipe(cleanCSS())
		.pipe(gulp.dest('../dist/styles');

	cb()
	
}

exports.mergeCss = mergeCss