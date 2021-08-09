{
  "variables": {
    "git_inputs": [
      "<(module_root_dir)/.gitmodules"
    ],
    "module_inputs": [
      "<(module_root_dir)/node/node.gyp"
    ]
  },
  "targets": [
    {
      "target_name": "git",
      "type": "none",
      "actions": [
        {
          "action_name": "gitmodules",
          "inputs": [
            "<@(git_inputs)"
          ],
          "outputs": [
            "<(module_root_dir)/node/node.gyp"
          ],
          "action": [
            "python",
            ".gyp/gyp_action_git.py",
            "submodule",
            "update",
            "--init"
          ]
        }
      ]
    },
    {
      "target_name": "<(module_name)",
      "type": "none",
      "actions": [
        {
          "action_name": "build",
          "inputs": [
            "<@(module_inputs)"
          ],
          "outputs": [
            "<(PRODUCT_DIR)/<(module_name)"
          ],
          "action": [
            "python",
            ".gyp/gyp_action_yarn.py",
            "make"
          ]
        }
      ]
    }
  ]
}
