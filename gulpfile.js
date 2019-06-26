var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('dev', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
  gulp.watch('./css/*.css', browserSync.reload);
  gulp.watch('./js/*.js', browserSync.reload);
  gulp.watch('./*.html', browserSync.reload);
});
