# Shared lib (so/dylib/dll) for Node.js

This project provides shared lib for [Node.js](https://nodejs.org).

## Usage

Install via npm/yarn:
```
npm install @kungfu-trader/libnode
```

Be default it downloads prebuilt lib files from a site host by [AWS CN](https://prebuilt.libkungfu.cc).
If need to use it overseas, use npm config to set it to AWS US before npm install:
```
npm config set link_node_binary_host_mirror https://prebuilt.libkungfu.io
```

### Compile and Link

Get the path for shared lib for compilers:
```
node -p "require('@kungfu-trader/libnode').libpath"
```

Get the headers path:
```
node -p "require('@kungfu-trader/libnode').include"
```

## Build with GitHub Actions

If you need other versions of Node.js that we don't provide, you can fork [this repo on GitHub](https://github.com/kungfu-trader/libnode) and build with GitHub Actions. There is a workflow named "Build" that can be triggered mannually with an input argument, type the git tag of [node](https://github.com/nodejs/node) that you want to use and go. The result will be uploaded to GitHub Actions when successfully finished.
