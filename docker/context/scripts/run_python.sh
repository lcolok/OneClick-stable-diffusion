#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"
conda activate py3.10.6

# 运行 Python 脚本
cd $NOTEBOOK_DIR/stable-diffusion-webui

# 快速启动,但是前提是已经安装了依赖,否则无法正常启动,需要进一步调试
python webui.py \
    --port ${SDWEBUI_PORT} \
    --api \
    --disable-safe-unpickle \
    --opt-sdp-attention \
    --listen \
    --skip-install \
    --ckpt ./models/Stable-diffusion/revAnimated_v11.safetensors
    # --nowebui \