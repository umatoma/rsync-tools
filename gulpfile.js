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

  return watch(files, (vinyl) => {
    gutil.log('File ' + vinyl.path + ' was ' + vinyl.event + ', running tasks...');

    let rsync = new Rsync()
      .shell(config.shell || 'ssh')
      .flags(config.flags || 'azr')
      .set('progress')
      .delete()
      .exclude(config.exclude || ['.rsync-tool.json', '.git'])
      .source(config.source || process.cwd() + '/')
      .destination(config.destination);
    console.log(rsync.command());
    rsync.execute(function(err, code, cmd) {
      if (err) {
        console.log('[ERROR]', err.message)
      }
      console.log('[CODE]', code);
      console.log('[COMMAND]', cmd);
    });
  });
});