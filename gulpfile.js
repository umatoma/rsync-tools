'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const Rsync = require('rsync');
const watch = require('gulp-watch');

// remove --gulpfile and --cwd options
const argv = require('./lib/cmd-args')(process.argv.slice(0, -4));

const DEBUG_MODE = (argv.debug === true);

/**
 * Get config from json file.
 *
 * @return {object} - Config object
 */
function getConfigFromFile() {
  const configPath = path.resolve(process.cwd(), '.rsync-tool.json');
  const userConfig = JSON.parse(fs.readFileSync(configPath));
  const config = {
    shell: 'ssh',
    flags: 'azr',
    files: ['**/*', '!.rsync-tool.json', '!.git'],
    exclude: ['.rsync-tool.json', '.git'],
    source: `${process.cwd()}/`,
    destination: null
  };

  // add exclude files
  if (_.has(userConfig, 'exclude')) {
    config.exclude = config.exclude.concat(userConfig.exclude);
    config.files = config.files.concat(config.exclude.map(v => `!${v}`));
  }

  // merge user config
  _.merge(config, _.pick(userConfig, [
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
  const rsync = new Rsync()
    .shell(config.shell)
    .flags(config.flags)
    .set('progress')
    .deconste()
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

/**
 * Watch files and exec rsync command
 *
 * Command:
 *   $ rst watch
 */
gulp.task('watch', () => {
  const config = getConfigFromFile();

  return watch(config.files, (vinyl) => {
    gutil.log(`File ${vinyl.path} was ${vinyl.event}, running tasks...`);

    return execRsync(config, (err, code, cmd) => {
      if (err) {
        gutil.log('[ERROR]', err.message);
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
  const config = getConfigFromFile();

  return execRsync(config, (err, code, cmd) => {
    if (err) {
      gutil.log('[ERROR]', err.message);
    }
    gutil.log('[CODE]', code);
    gutil.log('[COMMAND]', cmd);

    done();
  });
});

/**
 * Synchronize the server to the local
 *
 * Command:
 *   $ rst sync-remote
 */
gulp.task('sync-remote', (done) => {
  const config = getConfigFromFile();
  const source = _.clone(config.destination);
  const destination = _.clone(config.source);
  config.source = source;
  config.destination = destination;

  return execRsync(config, (err, code, cmd) => {
    if (err) {
      gutil.log('[ERROR]', err.message);
    }
    gutil.log('[CODE]', code);
    gutil.log('[COMMAND]', cmd);

    done();
  });
});
