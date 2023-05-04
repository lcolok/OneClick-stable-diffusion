#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"

# 启动 LAMA Cleaner 服务器
conda activate lama_cleaner && \
lama-cleaner --model=lama --device=cuda --host=0.0.0.0 --port=${LAMA_CLEANER_PORT}