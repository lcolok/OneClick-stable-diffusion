#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"

# 启动 Jupyter Notebook 服务器
conda activate py3.10.6 &&
    python app.py --input_audio_max_duration -1 --server_name 0.0.0.0 --server_port ${FASTER_WHISPER_WEBUI_PORT} --auto_parallel True
