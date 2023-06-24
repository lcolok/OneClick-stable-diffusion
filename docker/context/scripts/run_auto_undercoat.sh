#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"

# 切换到主程序目录
cd $NOTEBOOK_DIR/auto_undercoat

# 快速启动,但是前提是已经安装了依赖,否则无法正常启动,需要进一步调试
conda activate py3.10.6 && python app.py