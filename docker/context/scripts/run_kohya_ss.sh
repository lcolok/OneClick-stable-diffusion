#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"

# 切换到主程序目录
cd $NOTEBOOK_DIR/kohya_ss

conda activate py3.10.6 &&
    python kohya_gui.py --listen 0.0.0.0 --server_port ${KOHYA_SS_PORT} --inbrowser --share