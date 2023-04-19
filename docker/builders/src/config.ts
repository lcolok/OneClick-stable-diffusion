export type BuildConfigType = {
  [key: string]: {
    tag: string;
    dockerfile: string;
    dependencies?: string[];
  };
};

export const buildConfig: BuildConfigType = {
  conda_build: {
    tag: "conda:jupyter",
    dockerfile: "Dockerfile.conda",
  },
  py_build: {
    tag: "py:3.10.6-torch2.0.0",
    dockerfile: "Dockerfile.py",
    dependencies: ["conda_build"],
  },
  sdwebui_base_build: {
    tag: "sdwebui_base:rtx4090",
    dockerfile: "Dockerfile.sdwebui_base",
    dependencies: ["conda_build", "py_build"],
  },
  sdwebui_ext_build: {
    tag: "sdwebui_ext:rtx4090",
    dockerfile: "Dockerfile.sdwebui_ext",
    dependencies: ["conda_build", "py_build", "sdwebui_base_build"],
  },
};

// 构建方案选项列表
export const projectOptions = [
  {
    value: "conda_build",
    label: "构建Conda镜像",
    hint: "基于nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04镜像，包含MiniConda、JupyterLab、Openbayes主题",
  },
  {
    value: "py_build",
    label: "构建Python镜像",
    hint: "包含Python3.10.6和Pytorch2.0.0",
  },
  {
    value: "sdwebui_base_build",
    label: "构建Stable Diffusion WebUI基本镜像",
  },
  {
    value: "sdwebui_ext_build",
    label: "构建Stable Diffusion WebUI附带常用插件的镜像",
    hint: "包含汉化、图库浏览器、ControlNet等",
  },
];
