# 第一阶段：构建JupyterLab环境
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04 AS jupyter_env_builder

ENV NOTEBOOK_DIR /home

# 设置默认 shell 为 bash，并使用“-i”选项启动shell
SHELL ["/bin/bash", "-c", "-i"]

# 安装curl和xz-utils
RUN apt-get update && \
    apt-get install -y curl xz-utils git

# 配置容器中的环境

# 安装Miniconda，使用Anaconda官方脚本安装
RUN curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
    sh Miniconda3-latest-Linux-x86_64.sh -b -p $HOME/miniconda && \
    echo 'export PATH="$HOME/miniconda/bin:$PATH"' >> ~/.bashrc

RUN conda init

# 安装jupyterlab
RUN conda install -y jupyter
    # jupyter notebook --generate-config && \
    # echo "c.NotebookApp.ip = '*'" >> ~/.jupyter/jupyter_notebook_config.py && \
    # echo "c.NotebookApp.open_browser = False" >> ~/.jupyter/jupyter_notebook_config.py && \
    # echo "c.NotebookApp.password = ''" >> ~/.jupyter/jupyter_notebook_config.py

# 安装Node.js
RUN curl -LO https://nodejs.org/dist/v18.16.0/node-v18.16.0-linux-x64.tar.xz && \
    tar -xf node-v18.16.0-linux-x64.tar.xz -C /usr/local --strip-components=1

# 安装jupyterlab-openbayes-theme（可选，为了养眼）
RUN conda activate base && \
    jupyter labextension install jupyterlab-openbayes-theme

# 安装中文语言包
RUN pip install jupyterlab-language-pack-zh-CN

# 创建并更新JupyterLab配置文件，设置主题和语言
RUN jupyter lab --generate-config && \
    mkdir -p ~/.jupyter/lab/user-settings/@jupyterlab/translation-extension && \
    echo '{ "locale": "zh_CN" }' > ~/.jupyter/lab/user-settings/@jupyterlab/translation-extension/plugin.jupyterlab-settings && \
    mkdir -p ~/.jupyter/lab/user-settings/@jupyterlab/apputils-extension && \
    echo '{ "theme": "OpenBayes" }' > ~/.jupyter/lab/user-settings/@jupyterlab/apputils-extension/themes.jupyterlab-settings

# 添加以下命令以更改Jupyter的默认shell为bash
RUN echo "c.NotebookApp.terminado_settings = {'shell_command': ['/bin/bash']}" >> ~/.jupyter/jupyter_notebook_config.py

# 启用颜色支持
# RUN echo 'export PS1="\[\e[36m\]\u\[\e[m\]@\[\e[32m\]\h:\[\e[33m\]\w\[\e[m\]\$ "' >> ~/.bashrc
RUN sed -i 's/#force_color_prompt=yes/force_color_prompt=yes/' ~/.bashrc
RUN echo 'force_color_prompt=yes' >> ~/.bashrc

# 第二阶段：创建名为py3.10.6的Python环境，安装PyTorch 2.0.0环境
FROM jupyter_env_builder AS py_builder

WORKDIR $NOTEBOOK_DIR
RUN conda create -y -n py3.10.6 python=3.10.6 && \
    echo "conda activate py3.10.6" >> ~/.bashrc

RUN pip3 install torch torchvision torchaudio --index-url https://mirrors.tencent.com/pypi/simple

# 第三阶段：根据输入的参数创建不同的环境镜像
FROM py_builder AS env_builder

# 如果参数是 sdwebui，则克隆 stable-diffusion-webui 项目到 NOTEBOOK_DIR 目录下，并安装依赖
ARG app_env
ENV APP_ENV ${app_env}

# 如果参数是 sdwebui，则克隆 stable-diffusion-webui 项目到 NOTEBOOK_DIR 目录下
RUN if [ "$APP_ENV" = "sdwebui" ]; then \
        cd $NOTEBOOK_DIR && \
        git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git; \
    fi

# 如果参数是 sdwebui，则安装项目依赖
RUN if [ "$APP_ENV" = "sdwebui" ]; then \
        cd $NOTEBOOK_DIR/stable-diffusion-webui && \
        pip install -r requirements.txt && \
        cd /; \
    fi

# 如果参数是 sdwebui，则安装OpenGL
RUN if [ "$APP_ENV" = "sdwebui" ]; then \
        apt-get install -y libgl1-mesa-glx libglu1-mesa libxi-dev libglib2.0-0; \
    fi
    
# 设置默认 shell 为 bash，并使用“-i”选项启动shell
SHELL ["/bin/bash", "-c", "-i"]

# 启动Jupyter Notebook服务器
CMD conda activate base && \
    jupyter lab --ip 0.0.0.0 --port 33333 --no-browser --allow-root --notebook-dir=$NOTEBOOK_DIR