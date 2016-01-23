var gulp = require('gulp'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	watch = require('gulp-watch'),
	browserSync = require('browser-sync').create(),
	cp = require('child_process');


/* ==========================================================================
   paths
   ========================================================================== */
var paths = {
		src : {
			script : ['./static/js/script.js'],
			script_plugins : ['./static/js/_plugins/**/*.js'],
			style : ['./static/scss/**/*.scss'],
			html : ['./**/*.html']
		},
		dist : {
			script : './static/js/',
			style : './static/css/'
		},
		site : {
			script : './_site/static/js/',
			style : './_site/static/css/'
		}

	}


/* ==========================================================================
   error log
   ========================================================================== */
function errorlog(err){

	console.error(err.message);
	this.emit('end');
}


/* ==========================================================================
   script Task
   ========================================================================== */
gulp.task('script', ['script_plugins'], function() {

	gulp.src(paths.src.script)
		.pipe(sourcemaps.init())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(uglify())
		.on('error', errorlog)
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.site.script))
		.pipe(gulp.dest(paths.dist.script))
		.pipe(browserSync.stream());
});

gulp.task('script_plugins', function() {

	gulp.src(paths.src.script_plugins)
		.pipe(concat('plugins.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.site.script))
		.pipe(gulp.dest(paths.dist.script))
});


/* ==========================================================================
   style Task
   ========================================================================== */
gulp.task('style', function() {

	sass(paths.src.style, {sourcemap: true, style: 'compressed'})
		.on('error', errorlog)
		.pipe(autoprefixer({
			browsers: ["last 2 versions", "ie 8", "ie 7"],
			cascade: false
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.site.style))
		.pipe(gulp.dest(paths.dist.style))
		.pipe(browserSync.stream());
});


/* ==========================================================================
   server Task
   ========================================================================== */
gulp.task('browser-sync', function() {

	browserSync.init({
		port: 8080,
		server: {
			baseDir: "./_site/"
		}
	});
});


/* ==========================================================================
   jekyll-build Task
   ========================================================================== */
var jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";

gulp.task('jekyll-build', function (done) {

	return cp.spawn(jekyll, ['build'], {stdio: 'inherit'})
		.on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {

	browserSync.reload();
});


/* ==========================================================================
   watch Task
   ========================================================================== */
gulp.task('watch', ['jekyll-build'], function() {

	gulp.watch([paths.src.script, paths.src.script_plugins], ['script']);
	gulp.watch([paths.src.style], ['style']);
	gulp.watch(['*.md', '*.html', '_includes/**/*.html', '_layouts/**/*.html', '_posts/**/*', '_config.yml'], ['jekyll-rebuild']);
});


/* ==========================================================================
   default Task
   ========================================================================== */
gulp.task('default',['script', 'style', 'browser-sync', 'watch']);