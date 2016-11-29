/* eslint-disable import/no-extraneous-dependencies */

import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';
import { exec } from 'child_process';
import eslint from 'gulp-eslint';

const paths = {
  src: 'src',
  allSrcJs: 'src/**/*.js',
  gulpFile: 'gulpfile.js',
  buildDir: 'build',
};

gulp.task('clean', () => del(paths.buildDir));

gulp.task('web-ext lint', (callback) => {
  exec(`web-ext lint -s ${paths.src}`, (error, stdout) => {
    console.log(stdout);
    return callback(error);
  });
});

gulp.task('lint', ['web-ext lint'], () =>
  gulp.src([
    paths.allSrcJs,
    paths.gulpFile,
  ])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
);

gulp.task('build', ['lint', 'clean'], () =>
  gulp.src(paths.allSrcJs)
  .pipe(babel())
  .pipe(gulp.dest(paths.buildDir))
);

gulp.task('main', ['build'], (callback) => {
  exec(`node ${paths.buildDir}`, (error, stdout) => {
    console.log(stdout);
    return callback(error);
  });
});

gulp.task('watch', () => {
  gulp.watch(paths.allSrcJs, ['main']);
});

gulp.task('default', ['watch', 'main']);
