#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"

# 启动 LAMA Cleaner 服务器
conda activate py3.10.6 &&
    lama-cleaner --model=lama --device=cuda --host=0.0.0.0 --port=${LAMA_CLEANER_PORT} \
        --enable-realesrgan --realesrgan-model=RealESRGAN_x4plus --realesrgan-device=cuda \
        --enable-gfpgan --gfpgan-device cuda \
        --enable-restoreformer --restoreformer-device cuda \
        --enable-remove-bg \
        --enable-interactive-seg --interactive-seg-model=vit_h --interactive-seg-device=cuda \
        --enable-gif
