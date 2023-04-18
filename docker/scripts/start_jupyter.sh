#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"
conda activate base

# 启动 Jupyter Notebook 服务器
jupyter lab --ip 0.0.0.0 --port 33333 --no-browser --allow-root --notebook-dir=$NOTEBOOK_DIR