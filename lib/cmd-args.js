'use strict';

const pkg = require('../package.json');
const yargs = require('yargs');

module.exports = argv => yargs(argv)
  .usage([
    `rsync-tools (v${pkg.version})\n`,
    'Usage:',
    '$ rst <command> [options]'
  ].join('\n'))
  .command('watch', 'Watch files and exec rsync command')
  .command('local', 'Synchronize the local to the server')
  .command('remote', 'Synchronize the server to the local')
  .command('w', 'watch command alias')
  .command('l', 'local command alias')
  .command('r', 'remote command alias')
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
