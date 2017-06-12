var gulp = require('gulp');
var inlinesource = require('gulp-inline-source');

gulp.task('build', function () {
	return gulp.src('./page.html')
		.pipe(inlinesource({
			compress: false
		}))
		.pipe(gulp.dest('./site'));
});