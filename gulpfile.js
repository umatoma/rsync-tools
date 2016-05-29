'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const Rsync = require('rsync');
const watch = require('gulp-watch');

// remove --gulpfile and --cwd options
const argv = require('yargs')(process.argv.slice(0, -4))
  .usage('Usage: $ rst <command> [options]')
  .command('watch', 'Watch files and exec rsync command')
  .command('sync-local', 'Synchronize the local to the server')
  .option('debug', {
    describe: 'Debug mode',
    type: 'boolean'
  })
  .strict()
  .help()
  .locale('en')
  .argv;

const DEBUG_MODE = (argv.debug === true);

/**
 * Watch files and exec rsync command
 *
 * Command:
 *   $ rst watch
 */
gulp.task('watch', (done) => {
  let config = getConfigFromFile();

  return watch(config.files, (vinyl) => {
    gutil.log('File ' + vinyl.path + ' was ' + vinyl.event + ', running tasks...');

    return execRsync(config, (err, code, cmd) => {
      if (err) {
        gutil.log('[ERROR]', err.message)
      }
      gutil.log('[CODE]', code);
      gutil.log('[COMMAND]', cmd);
    });
  });
});

/**
 * Synchronize the local to the server
 *
 * Command:
 *   $ rst sync-local
 */
gulp.task('sync-local', (done) => {
  let config = getConfigFromFile();

  return execRsync(config, (err, code, cmd) => {
    if (err) {
      gutil.log('[ERROR]', err.message)
    }
    gutil.log('[CODE]', code);
    gutil.log('[COMMAND]', cmd);

    done();
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

  return rsync.execute(
    callback,
    (data) => {
      if (DEBUG_MODE) {
        console.log(data.toString());
      }
    },
    (data) => {
      if (DEBUG_MODE) {
        console.log(data.toString());
      }
    });
}