const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.patchEnv = function () {
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('NPM_') || key.startsWith('npm_')) {
      delete process.env[key];
    }
  });
};

exports.run = function (cmd, argv, opts = {}) {
  opts.check = opts.check === undefined || opts.check;
  opts.cwd = fs.realpathSync(path.resolve(opts.cwd || process.cwd()));
  console.log(`$ ${cmd} ${argv.join(' ')}`);
  const result = spawnSync(cmd, argv, {
    shell: true,
    stdio: 'inherit',
    windowsHide: true,
    ...opts,
  });
  if (opts.check && result.status !== 0) {
    process.exit(result.status);
  }
  return result;
};
