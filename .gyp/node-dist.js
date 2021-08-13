const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const sywac = require('sywac');

const dist = (buildType) => {
  const nodeDistDir = path.join('dist', 'node');
  const copyFiles = (pattern) => {
    glob.sync(pattern).forEach((p) => {
      if (fse.lstatSync(p).isFile()) {
        fse.copySync(p, path.join(nodeDistDir, path.basename(p)));
      }
    });
  };
  fse.ensureDirSync(nodeDistDir);
  copyFiles(path.join('node', 'out', buildType, 'libnode*'));
  copyFiles(path.join('build', buildType, '*.*'));
};

const cli = sywac
  .path('--build-type', { defaultValue: 'Release' })
  .help('--help')
  .version('--version')
  .outputSettings({ maxWidth: 75 });

module.exports = cli;

async function main() {
  const argv = await cli.parseAndExit();
  dist(argv['build-type']);
}

if (require.main === module) main();
