const path = require('path');

const distDir = path.join(__dirname, 'dist', 'node');

exports.include = path.resolve(path.join(distDir, 'include'));
exports.libpath = path.resolve(distDir);
