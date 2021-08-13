const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const sywac = require('sywac');

const dist = (buildType) => {
  const nodeDistDir = path.join('dist', 'node');
  const exts = ['.json', '.dylib', '.so', '.dll', '.lib'];

  const include = (p) => fse.lstatSync(p).isFile() && exts.includes(path.extname(p));
  const copy = (p) => fse.copySync(p, path.join(nodeDistDir, path.basename(p)));
  const copyFiles = (pattern) => glob.sync(pattern).filter(include).forEach(copy);
  const makeSymbolLink = (pattern, ext) => {
    const link = (p) => fse.symlinkSync(path.basename(p), path.join(nodeDistDir, `libnode.${ext}`));
    glob.sync(path.join(nodeDistDir, pattern)).sort().reverse().slice(0, 1).forEach(link);
  };

  fse.ensureDirSync(nodeDistDir);
  fse.emptyDirSync(nodeDistDir);

  copyFiles(path.join('build', buildType, '*.*'));
  copyFiles(path.join('node', 'out', buildType, 'libnode*'));

  makeSymbolLink('libnode.*.dylib', 'dylib');
  makeSymbolLink('libnode.so.*', 'so');
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
