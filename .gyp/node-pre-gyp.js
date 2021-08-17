const { exitOnError, run } = require('./node-lib.js');

function node_pre_gyp(cmd, check = true) {
  const buildType = process.env.npm_package_config_build_type;
  const buildTypeOpt = buildType === 'Debug' ? ['--debug'] : [];
  const yarnArgs = ['node-pre-gyp', ...buildTypeOpt, ...cmd];
  run('yarn', yarnArgs, { check: check });
}

const cli = require('sywac')
  // commands
  .command('install', (argv) => {
    const skipBuild = process.env.KF_SKIP_FALLBACK_BUILD;
    node_pre_gyp(['install'], !skipBuild);
  })
  .command('build', (argv) => {
    node_pre_gyp(['configure', 'build']);
  })
  .command('clean', (argv) => {
    node_pre_gyp(['clean']);
  })
  .command('rebuild', (argv) => {
    node_pre_gyp(['rebuild']);
  })
  .command('package', (argv) => {
    node_pre_gyp(['package']);
  })
  .help('--help')
  .version('--version')
  .showHelpByDefault();

module.exports = cli;

async function main() {
  await cli.parseAndExit();
}

if (require.main === module) main().catch(exitOnError);
