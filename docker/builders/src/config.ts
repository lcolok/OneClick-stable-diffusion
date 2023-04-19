export type BuildConfigType = {
  [key: string]: {
    tag: string;
    dockerfile: string;
    dockerfilePath?: string;
    label: string;
    hint?: string;
    dependencies?: string[];
  };
};

// 指定路径
const dockerfilesPath = "../dockerfile";

const baseBuildConfig: BuildConfigType = {
  conda_build: {
    tag: "conda:jupyter",
    dockerfile: "Dockerfile.conda",
    label: "构建Conda镜像",
    hint: "基于nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04镜像，包含MiniConda、JupyterLab、Openbayes主题",
  },
  py_build: {
    tag: "py:3.10.6-torch2.0.0",
    dockerfile: "Dockerfile.py",
    label: "构建Python镜像",
    hint: "包含Python3.10.6和Pytorch2.0.0",
    dependencies: ["conda_build"],
  },
  sdwebui_base_build: {
    tag: "sdwebui_base:rtx4090",
    dockerfile: "Dockerfile.sdwebui_base",
    label: "构建Stable Diffusion WebUI基本镜像",
    dependencies: ["conda_build", "py_build"],
  },
  sdwebui_ext_build: {
    tag: "sdwebui_ext:rtx4090",
    dockerfile: "Dockerfile.sdwebui_ext",
    label: "构建Stable Diffusion WebUI附带常用插件的镜像",
    hint: "包含汉化、图库浏览器、ControlNet等",
    dependencies: ["conda_build", "py_build", "sdwebui_base_build"],
  },
};

// 修改后的自动生成 dockerfilePath 的函数
function generateDockerfilePath(path: string, dockerfile: string): string {
  return `${path}/${dockerfile}`;
}

// 构建包含 dockerfilePath 的新 buildConfig 对象的函数
function generateBuildConfigWithDockerfilePath(
  config: BuildConfigType,
  path: string
): BuildConfigType {
  const newConfig: BuildConfigType = {};

  for (const key in config) {
    newConfig[key] = {
      ...config[key],
      dockerfilePath: generateDockerfilePath(path, config[key].dockerfile),
    };
  }

  return newConfig;
}

// 传入路径生成新的 buildConfig 对象
export const buildConfig = generateBuildConfigWithDockerfilePath(
  baseBuildConfig,
  dockerfilesPath
);

// 根据 buildConfig 生成 projectOptions 数组
export const projectOptions = Object.keys(buildConfig).map((key) => {
  const { label, hint } = buildConfig[key];
  return {
    value: key,
    label,
    ...(hint && { hint }),
  };
});
