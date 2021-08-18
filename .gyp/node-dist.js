const { exitOnError } = require('./node-lib.js');
const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const sywac = require('sywac');

const dist = (buildType) => {
  const nodeDistDir = path.join('dist', 'node');
  const exts = ['.json', '.node', '.dylib', '.so', '.dll', '.lib'];

  const include = (p) => path.basename(p).includes('.so.') || exts.includes(path.extname(p));
  const match = (p) => fse.lstatSync(p).isFile() && include(p);
  const copy = (p) => fse.copySync(p, path.join(nodeDistDir, path.basename(p)));
  const copyFiles = (pattern) => glob.sync(pattern).filter(match).forEach(copy);
  const copyHeaders = (source) => {
    const target = path.join(nodeDistDir, 'include');
    glob.sync(path.join(source, '**', '*.h')).forEach((p) => {
      fse.copySync(p, path.join(target, p.replace(source, '')));
    });
  };
  const makeSymbolLink = (pattern, ext) => {
    const target = path.join(nodeDistDir, `libnode.${ext}`);
    const link = (p) => fse.symlinkSync(path.basename(p), target);
    glob.sync(path.join(nodeDistDir, pattern)).sort().reverse().slice(0, 1).forEach(link);
  };

  fse.ensureDirSync(nodeDistDir);
  fse.emptyDirSync(nodeDistDir);

  copyFiles(path.join('build', buildType, '*.*'));
  copyFiles(path.join('node', 'out', buildType, 'libnode*'));

  copyHeaders(path.join('node', 'src'));
  copyHeaders(path.join('node', 'deps', 'v8', 'include'));
  copyHeaders(path.join('node', 'deps', 'uv', 'include'));

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

if (require.main === module) main().catch(exitOnError);
