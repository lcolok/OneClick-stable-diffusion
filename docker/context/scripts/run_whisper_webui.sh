#!/bin/bash

# 激活 Conda 环境
eval "$(conda shell.bash hook)"

# 启动 Jupyter Notebook 服务器
conda activate py3.10.6 && python app.py --port ${WHISPER_WEBUI_PORT}
