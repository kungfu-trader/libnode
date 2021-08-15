const path = require('path');

const rootDir = path.dirname(path.dirname(__dirname));
const distDir = path.join(rootDir, 'dist', 'node');

exports.include = path.resolve(path.join(distDir, 'include'));
exports.libpath = path.resolve(distDir);
