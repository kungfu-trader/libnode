const { run } = require('./node-lib.js');
const fs = require('fs');
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

