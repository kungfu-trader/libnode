const { run } = require('./node-lib.js');
const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');
const os = require('os');


if (process.platform === 'win32') {
    run("vcbuild", ["dll", "x64", "projgen"], "node");
    run("vcbuild", ["dll", "x64", "noprojgen"], "node");
}
else {
    run("./configure", ["--shared"], "node");
    run("make", ["-j", `${os.cpus().length}`], "node");
}

const distDir = path.join("dist", "node");
fse.ensureDirSync(distDir);

glob.sync(path.join("node", "out", "Release", "libnode*")).forEach((p) => {
    console.log(p);
    console.log(path.basename(p));
    fse.copySync(p, path.join(distDir, path.basename(p)));
});
