#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PrebuiltHostConfig = 'binary_host_mirror';
const PrebuiltHost_US = 'https://prebuilt.libkungfu.io';

const spawnOptsPipe = { shell: true, stdio: 'pipe', windowsHide: true };
const spawnOptsInherit = { shell: true, stdio: 'inherit', windowsHide: true };

const packageJson = JSON.parse(fs.readFileSync(path.resolve(path.dirname(__dirname), 'package.json')));
const key = packageJson.binary.module_name;
const npmConfigKey = `${key}_${PrebuiltHostConfig}`;

const scope = (npmConfigValue) => (npmConfigValue === 'undefined' ? '[package.json]' : '[user]');

function npmCall(npmArgs) {
  console.log(`$ npm ${npmArgs.join(' ')}`);
  const result = spawnSync('npm', npmArgs, spawnOptsInherit);
  if (result.status !== 0) {
    console.error(`Failed with status ${status}`);
    process.exit(result.status);
  }
}

function getNpmConfigValue(key) {
  return spawnSync('npm', ['config', 'get', key], spawnOptsPipe)
    .output.filter((e) => e && e.length > 0)
    .toString()
    .trimEnd();
}

function showAllConfig() {
  const hostConfigValue = getNpmConfigValue(npmConfigKey);
  const value = hostConfigValue === 'undefined' && packageJson ? packageJson.binary.host : hostConfigValue;
  console.log(`[binary] ${npmConfigKey} = ${value} ${scope(hostConfigValue)}`);
}

if (require.main === module && process.env.CI && process.env.GITHUB_ACTIONS) {
  npmCall(['config', 'set', npmConfigKey, PrebuiltHost_US]);
}

if (require.main === module) {
  showAllConfig();
}
