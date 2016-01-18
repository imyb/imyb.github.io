var gulp = require('gulp'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	scsslint = require('gulp-scss-lint'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	watch = require('gulp-watch'),
	webserver = require('gulp-webserver'),
	cp = require('child_process');



/* paths */
var paths = {
		root : './',
		src : {
			styles : './static/css/',
			scripts : './static/js/'
		},
		dist : {
			styles : './static/css/',
			scripts : './static/js/'
		}
	};



/* script */
gulp.task('script:plugins', function(){

	gulp.src(paths.src.scripts + '_plugins/**/*.js')
		.pipe(concat('plugins.js'))
		.pipe(gulp.dest('./_site/' + paths.dist.scripts))
		.pipe(gulp.dest(paths.dist.scripts))
});

gulp.task('script', function() {

	gulp.src([paths.src.scripts + '*.js', '!' + paths.src.scripts + 'plugins.js', '!' + paths.src.scripts + '*.min.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('./_site/' + paths.dist.scripts))
		.pipe(gulp.dest(paths.dist.scripts))
});



/* style */
gulp.task('style', function(){

	gulp.src(paths.src.styles + '*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'/*'expanded'*/}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ["last 2 versions", "ie 8", "ie 7"],
			cascade: false
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./_site/' + paths.dist.styles))
		.pipe(gulp.dest(paths.dist.styles))
});



/* webserver */
gulp.task('webserver', function() {

	gulp.src('./_site/')
		.pipe(webserver({
			port: 9000,
			livereload: true
			//directoryListing: true,
			//open: true,
			//fallback: 'index.html'
		}));
});



/* jekyll-build */
var jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";

gulp.task('jekyll-build', function (done) {
	return cp.spawn(jekyll, ['build'], {stdio: 'inherit'})
		.on('close', done);
});



/* watch */
gulp.task('watch', ['jekyll-build'], function(){

	gulp.watch(paths.src.scripts + '_plugins/**/*.js', ['script:plugins']);
	gulp.watch([paths.src.scripts + '*.js', '!' + paths.src.scripts + 'plugins.js', '!' + paths.src.scripts + '*.min.js'], ['script']);
	gulp.watch([paths.src.styles + '*.scss', paths.src.styles + '_plugins/**/*.css'], ['style']);
	gulp.watch(['*.md', '*.html', '_includes/**/*.html', '_layouts/**/*.html', '_posts/**/*', '_config.yml'], ['jekyll-build']);
});



/* default */
gulp.task('default', ['script:plugins', 'script', 'style', 'webserver', 'watch']);
