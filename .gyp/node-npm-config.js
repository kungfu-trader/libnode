#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PrebuiltHostConfig = 'binary_host_mirror';
const PrebuiltHost_CN = 'https://prebuilt.libkungfu.cc';
const PrebuiltHost_US = 'https://prebuilt.libkungfu.io';

const spawnOptsPipe = { shell: true, stdio: 'pipe', windowsHide: true };
const spawnOptsInherit = { shell: true, stdio: 'inherit', windowsHide: true };

const packageJson = JSON.parse(fs.readFileSync(path.resolve(path.dirname(__dirname), 'package.json')));

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
  const key = packageJson.binary.module_name;
  const npmConfigKey = `${key}_${PrebuiltHostConfig}`;
  const hostConfigValue = getNpmConfigValue(npmConfigKey);
  const value = hostConfigValue === 'undefined' && packageJson ? packageJson.binary.host : hostConfigValue;
  console.log(`[binary] ${npmConfigKey} = ${value} ${scope(hostConfigValue)}`);
}

async function main() {
  await require('sywac')
    .command('show', { run: showAllConfig })
    .command('auto', {
      run: () => {
        const githubActions = process.env.CI && process.env.GITHUB_ACTIONS;
        const prebuiltHost = githubActions ? PrebuiltHost_US : PrebuiltHost_CN;
        const setConfig = (key, value) => githubActions && npmCall(['config', 'set', key, value]);
        setConfig(`link_node_${PrebuiltHostConfig}`, prebuiltHost);
        showAllConfig();
      },
    })
    .help('--help')
    .version('--version')
    .showHelpByDefault()
    .parseAndExit();
}

if (require.main === module) main().catch(console.error);
