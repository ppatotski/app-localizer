var gulp = require('gulp');
var inlinesource = require('gulp-inline-source');

gulp.task('build', function () {
	return gulp.src('./src/index.html')
		.pipe(inlinesource({
			compress: false
		}))
		.pipe(gulp.dest('./docs'));
});