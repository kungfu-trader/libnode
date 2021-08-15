{
  "variables": {
    "gyp_dir": "<(module_root_dir)/.gyp",
    "git_inputs": [
      "<(module_root_dir)/.gitmodules",
    ],
    "libnode_inputs": [
      "<!@(node -p \"require('glob').sync('node/**/*.*(h|cc|S)', {ignore:'node/out/**'}).join(' ');\")",
    ],
    "module_inputs": [
      "<!@(node -p \"require('glob').sync('src/**/*.*(h|cc)').join(' ');\")",
    ],
    "gyp_inputs": [
      "<!@(node -p \"require('glob').sync('.gyp/**/*.*(js|py)').join(' ');\")",
    ],
  },
  "targets": [
    {
      "target_name": "git",
      "type": "none",
      "actions": [
        {
          "action_name": "gitmodules",
          "inputs": [
            "<@(git_inputs)",
          ],
          "outputs": [
            "<(module_root_dir)/node/node.gyp",
          ],
          "action": [
            "python",
            "<(gyp_dir)/gyp_action_git.py",
            "submodule",
            "update",
            "--init"
          ]
        }
      ]
    },
    {
      "target_name": "libnode",
      "type": "none",
      "dependencies": [
        "git"
      ],
      "actions": [
        {
          "action_name": "libnode",
          "inputs": [
            "<@(libnode_inputs)",
          ],
          "outputs": [
            "<(PRODUCT_DIR)/libnode.json",
          ],
          "action": [
            "python",
            "<(gyp_dir)/gyp_action_yarn.py",
            "make",
          ]
        }
      ]
    },
    {
      "target_name": "<(module_name)",
      "dependencies": [
        "libnode",
      ],
      "sources": [
        "<@(module_inputs)",
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    },
    {
      "target_name": "dist",
      "type": "none",
      "dependencies": [
        "libnode",
        "<(module_name)",
      ],
      "actions": [
        {
          "action_name": "dist",
          "inputs": [
            "<@(libnode_inputs)",
            "<@(module_inputs)",
            "<@(gyp_inputs)",
          ],
          "outputs": [
            "<(module_root_dir)/dist/node/libnodebuildinfo.json",
          ],
          "action": [
            "python",
            "<(gyp_dir)/gyp_action_yarn.py",
            "dist",
          ]
        }
      ]
    }
  ]
}
