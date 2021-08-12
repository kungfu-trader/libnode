const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const sywac = require('sywac');

const dist = (productDir) => {
  const nodeDistDir = path.join('dist', 'node');
  const copyFiles = (pattern) => {
    glob.sync(pattern).forEach((p) => {
      if (fse.lstatSync(p).isFile()) {
        fse.copySync(p, path.join(nodeDistDir, path.basename(p)));
      }
    });
  };
  fse.ensureDirSync(nodeDistDir);
  copyFiles(path.join('node', 'out', productDir, 'libnode*'));
  copyFiles(path.join('build', productDir, '*.*'));
};

const cli = sywac
  .path('--product-dir', { defaultValue: 'Release' })
  .help('-h, --help')
  .version('-v, --version')
  .outputSettings({ maxWidth: 75 });

module.exports = cli;

async function main() {
  const argv = await cli.parseAndExit();
  dist(argv['product-dir']);
}

if (require.main === module) main();
