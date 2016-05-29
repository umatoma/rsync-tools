'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const Rsync = require('rsync');
const watch = require('gulp-watch');

/**
 * Watch files and exec rsync command
 *
 * Usage:
 *   $ rst watch
 */
gulp.task('watch', (done) => {
  let config = getConfigFromFile();

  watch(config.files, (vinyl) => {
    gutil.log('File ' + vinyl.path + ' was ' + vinyl.event + ', running tasks...');

    execRsync(config, (err, code, cmd) => {
      if (err) {
        gutil.log('[ERROR]', err.message)
      }
      gutil.log('[CODE]', code);
      gutil.log('[COMMAND]', cmd);
    });
  });
});

/**
 * Get config from json file.
 *
 * @return {object} - Config object
 */
function getConfigFromFile() {
  let config_path = path.resolve(process.cwd(), '.rsync-tool.json');
  let user_config = JSON.parse(fs.readFileSync(config_path));
  let config = {
    shell: 'ssh',
    flags: 'azr',
    files: ['**/*', '!.rsync-tool.json', '!.git'],
    exclude: ['.rsync-tool.json', '.git'],
    source: process.cwd() + '/',
    destination: null
  };

  // add exclude files
  if (user_config.hasOwnProperty('exclude')) {
    config.exclude = config.exclude.concat(user_config.exclude);
    config.files = config.files.concat(config.exclude.map( v => '!' + v ));
  }

  // merge user config
  _.merge(config, _.pick(user_config, [
    'shell',
    'flags',
    'source',
    'destination'
  ]));

  return config;
}

/**
 * Execute rsync command
 *
 * @param {object} config - Config object
 * @param {function} callback - Callback function
 */
function execRsync(config, callback) {
  let rsync = new Rsync()
    .shell(config.shell)
    .flags(config.flags)
    .set('progress')
    .delete()
    .exclude(config.exclude)
    .source(config.source)
    .destination(config.destination);

  rsync.execute(callback);
}