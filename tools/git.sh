#!/bin/bash

# 查找 gitPushHelper.py 文件
git_push_helper_path=$(find / -name "gitPushHelper.py")

# 如果找到了 gitPushHelper.py 文件
if [ -n "$git_push_helper_path" ]; then
  # 使用 python 在命令行下运行 gitPushHelper.py 脚本
  python "$git_push_helper_path"
else
  # 否则，提示找不到 gitPushHelper.py 文件
  echo "Cannot find gitPushHelper.py"
fi
