#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"

# 切换到主程序目录
cd $NOTEBOOK_DIR/Rerender

conda activate py3.10.6 &&
    python app.py