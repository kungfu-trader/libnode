const { patchEnv, run } = require('./node-lib.js');
const fs = require('fs');
const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const os = require('os');
const sywac = require('sywac');
const convert = require('xml-js');

const arch = process.arch;
const nodeSrcDir = path.resolve('node');
const nodeDistDir = path.join(path.dirname(__dirname), 'dist', 'node');

const runWinPatch = () => {
  // Workaround from https://github.com/nodejs/node/issues/34539
  const loadXml = (filepath) => {
    const xml_raw = fs.readFileSync(filepath).toString();
    const xml_str = xml_raw.replace(/&/g, '&#038;');
    return convert.xml2js(xml_str, { compact: false });
  };
  const buildXml = (obj) => {
    return convert.js2xml(obj, { compact: false, spaces: 2 });
  };
  const fixVcxproj = (filepath, fix) => {
    const vcxproj = loadXml(filepath);
    fix(vcxproj.elements[0]);
    const xml_raw = buildXml(vcxproj).toString();
    const xml_str = xml_raw.replace(/&amp;(?=(apos|quot|[gl]t);|#)/g, '&');
    fs.writeFileSync(filepath, xml_str);
  };
  const libnodeRefs = {};
  fixVcxproj(path.join(nodeSrcDir, 'libnode.vcxproj'), (vcxproj) => {
    const delimiter = ';';
    const winmmLib = 'WinMM.lib';
    for (const itemDefinitionGroup of vcxproj.elements.filter((e) => e.name === 'ItemDefinitionGroup')) {
      const link = itemDefinitionGroup.elements.filter((e) => e.name === 'Link')[0];
      const additionalDependencies = link.elements.filter((e) => e.name === 'AdditionalDependencies')[0];
      var deps = additionalDependencies.elements[0].text.split(delimiter);
      if (!deps.filter((d) => d.toUpperCase() === winmmLib.toUpperCase()).length) {
        deps.push(winmmLib);
      }
      additionalDependencies.elements[0].text = deps.join(delimiter);
    }
    for (const itemGroup of vcxproj.elements.filter((e) => e.name === 'ItemGroup')) {
      itemGroup.elements
        .filter((e) => e.name === 'ProjectReference')
        .forEach((r) => {
          libnodeRefs[r.attributes.Include] = r;
        });
    }
  });
  fixVcxproj(path.join(nodeSrcDir, 'node.vcxproj'), (vcxproj) => {
    for (const itemGroup of vcxproj.elements.filter((e) => e.name === 'ItemGroup')) {
      projectReferences = itemGroup.elements.filter((e) => e.name === 'ProjectReference');
      if (projectReferences.length) {
        itemGroup.elements = itemGroup.elements.filter((e) => {
          return e.name !== 'ProjectReference' || !(e.attributes.Include in libnodeRefs);
        });
      }
    }
  });
};

const buildWin = () => {
  patchEnv();
  run(path.join('.', 'vcbuild.bat'), ['dll', arch, 'release', 'projgen', 'nobuild'], { cwd: nodeSrcDir });
  runWinPatch();
  run(path.join('.', 'vcbuild.bat'), ['dll', 'noprojgen'], { cwd: nodeSrcDir });
};

const buildUnix = () => {
  run('sh', [path.join('.', 'configure'), '-C', '--shared'], { cwd: nodeSrcDir });
  run('make', ['-j', `${os.cpus().length}`], { cwd: nodeSrcDir });
};

const build = process.platform === 'win32' ? buildWin : buildUnix;

const stamp = (baseDir) => {
  const result = run('git', ['rev-parse', 'HEAD'], { cwd: nodeSrcDir, stdio: 'pipe' });
  const gitHead = result.output
    .filter((e) => e && e.length > 0)
    .toString()
    .trim();
  buildInfo = {
    build: {
      timestamp: new Date(),
    },
    git: {
      revision: gitHead,
    },
  };
  fs.writeFileSync(path.join(baseDir, 'libnode.json'), JSON.stringify(buildInfo, null, 2));
};

const cli = sywac
  .path('--product-dir', { defaultValue: 'Release' })
  .help('--help')
  .version('--version')
  .outputSettings({ maxWidth: 75 });

module.exports = cli;

async function main() {
  const argv = await cli.parseAndExit();
  build();
  stamp(path.join('build', argv['product-dir']));
}

if (require.main === module && !process.env.KF_SKIP_MAKE_LIBNODE) main();
