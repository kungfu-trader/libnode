const { run } = require('./node-lib.js');

function node_pre_gyp(cmd, check = true) {
  const buildType = process.env.npm_package_config_build_type;
  const buildTypeOpt = buildType === 'Debug' ? ['--debug'] : [];
  const yarnArgs = ['node-pre-gyp', ...buildTypeOpt, ...cmd];
  run('yarn', yarnArgs, { check: check });
}

exports.argv = require('yargs/yargs')(process.argv.slice(2))
  .command(
    (command = 'install'),
    (description = 'install through node-pre-gyp'),
    (builder = () => {}),
    (handler = () => {
      const skipBuild = process.env.KF_SKIP_FALLBACK_BUILD;
      node_pre_gyp(['install'], !skipBuild);
    }),
  )
  .command(
    (command = 'build'),
    (description = 'build from source'),
    (builder = () => {}),
    (handler = () => {
      node_pre_gyp(['configure', 'build']);
    }),
  )
  .command(
    (command = 'clean'),
    (description = 'clean'),
    (builder = () => {}),
    (handler = () => {
      node_pre_gyp(['clean']);
    }),
  )
  .command(
    (command = 'rebuild'),
    (description = 'rebuild from source'),
    (builder = () => {}),
    (handler = () => {
      node_pre_gyp(['rebuild']);
    }),
  )
  .command(
    (command = 'package'),
    (description = 'package binary'),
    (builder = () => {}),
    (handler = () => {
      node_pre_gyp(['package']);
    }),
  )
  .demandCommand()
  .help().argv;
