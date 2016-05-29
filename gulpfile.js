'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const Rsync = require('rsync');
const watch = require('gulp-watch');

gulp.task('watch', (done) => {
  let config_path = path.resolve(process.cwd(), '.rsync-tool.json');
  let config = JSON.parse(fs.readFileSync(config_path));
  let files = ['**/*', '!.rsync-tool.json', '!.git'];
  let exclude = config.exclude || [];

  // add exclude files
  files = files.concat(exclude.map( v => '!' + v ));

  return watch(files, (vinyl) => {
    gutil.log('File ' + vinyl.path + ' was ' + vinyl.event + ', running tasks...');

    let rsync = new Rsync()
      .shell(config.shell || 'ssh')
      .flags(config.flags || 'azr')
      .set('progress')
      .delete()
      .exclude(exclude)
      .source(config.source || process.cwd() + '/')
      .destination(config.destination);

    rsync.execute(function(err, code, cmd) {
      if (err) {
        gutil.log('[ERROR]', err.message)
      }
      gutil.log('[CODE]', code);
      gutil.log('[COMMAND]', cmd);
    });
  });
});