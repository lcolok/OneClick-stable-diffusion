#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"
conda activate py3.10.6

# 运行 Python 脚本
cd $NOTEBOOK_DIR/stable-diffusion-webui
python launch.py \
    --api \
    --opt-sdp-attention \
    --listen \
    --skip-install \
    --ckpt ./models/Stable-diffusion/revAnimated_v11.safetensors
