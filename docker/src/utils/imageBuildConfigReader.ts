// 引入 Node.js 内置模块和第三方模块
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

// 获取配置文件路径
const configFile = path.join(__dirname, "./image_build_config.yaml");

// 读取配置文件并解析为 TypeScript 类型
const config = yaml.load(fs.readFileSync(configFile, "utf8")) as {
  dockerfilesPath: string; // Dockerfile 路径
  contextPath: string; // 构建上下文路径
  baseBuildConfig: BuildConfigType; // 构建配置对象
};

// 从配置文件中获取 Dockerfile 路径和构建配置对象
const dockerfilesPath = config.dockerfilesPath;
const baseBuildConfig = config.baseBuildConfig;
const contextPath = config.contextPath;

// 定义构建配置类型
export type BuildConfigType = {
  [key: string]: {
    tag: string; // 镜像标签
    dockerfile: string; // Dockerfile 文件名
    dockerfilePath?: string; // Dockerfile 文件路径
    contextPath?: string; // 构建上下文路径
    label: string; // 项目标签
    hint?: string; // 项目提示
    dependencies?: string[]; // 依赖列表
  };
};

// 生成 Dockerfile 文件路径的函数
function generateDockerfilePath(path: string, dockerfile: string): string {
  return `${path}/${dockerfile}`;
}

// 生成包含 Dockerfile 文件路径的新构建配置对象的函数
function generateBuildConfigWithDockerfilePath(
  config: BuildConfigType,
  path: string
): BuildConfigType {
  const newConfig: BuildConfigType = {};

  for (const key in config) {
    newConfig[key] = {
      ...config[key],
      dockerfilePath: generateDockerfilePath(path, config[key].dockerfile),
      contextPath: contextPath,
    };
  }

  return newConfig;
}

// 根据 Dockerfile 路径生成新的构建配置对象
export const buildConfig = generateBuildConfigWithDockerfilePath(
  baseBuildConfig,
  dockerfilesPath
);

// 根据构建配置对象生成项目选项数组
export const projectOptions = Object.keys(buildConfig).map((key) => {
  const { label, hint } = buildConfig[key];
  return {
    value: key,
    label,
    ...(hint && { hint }),
  };
});
