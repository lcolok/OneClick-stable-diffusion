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
    --opt-sdp-no-mem-attention \
    --listen \
    --skip-install \
    --disable-nan-check \
    --no-half-vae
    # --ckpt ./models/Stable-diffusion/revAnimated_v11.safetensors
    # --nowebui \

# 开启 –opt-sdp-attention 后会提高显存的需求，你会发现之前hires可以开启的分辨率，现在会爆显存，你可以配合分块vae插件来解决这个问题。 存在和 xformer 一样的不确定性问题，可以通过修改为 --opt-sdp-no-mem-attention 解决，但是会损失一丢丢速度