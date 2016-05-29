'use strict';

const pkg = require('../package.json');

module.exports = function(argv) {
  return require('yargs')(argv)
    .usage([
      `rsync-tools (v${pkg.version})\n`,
      'Usage:',
      '$ rst <command> [options]'
    ].join('\n'))
    .command('watch', 'Watch files and exec rsync command')
    .command('sync-local', 'Synchronize the local to the server')
    .option('debug', {
      describe: 'Debug mode',
      type: 'boolean'
    })
    .strict()
    .help()
    .version()
    .epilog([
      'Report bugs to github issue.',
      'github: https://github.com/umatoma/rsync-tools'
    ].join('\n'))
    .locale('en')
    .argv;
};