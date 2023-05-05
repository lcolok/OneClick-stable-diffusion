// 引入 Node.js 内置模块和第三方模块
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import i18next from '@i18n';
import { BuildConfig } from '@types';

// 获取配置文件路径
const configFile = path.join(
  __dirname,
  '../configs',
  './imageBuildConfig.yaml',
);

interface globalConfigTypes {
  targetBuilds: string[];
}

// 读取配置文件并解析为 TypeScript 类型
const config = yaml.load(fs.readFileSync(configFile, 'utf8')) as {
  dockerfilesPath: string; // Dockerfile 路径
  contextPath: string; // 构建上下文路径
  baseBuildConfig: BuildConfig; // 构建配置对象
  globalConfig: globalConfigTypes; // 目标构建
};

// 从配置文件中获取 Dockerfile 路径和构建配置对象
const dockerfilesPath = config.dockerfilesPath;
const baseBuildConfig = config.baseBuildConfig;
const contextPath = config.contextPath;

export const globalConfig = config.globalConfig

// 生成 Dockerfile 文件路径的函数
function generateDockerfilePath(path: string, dockerfile: string): string {
  return `${path}/${dockerfile}`;
}

// 生成包含 Dockerfile 文件路径的新构建配置对象的函数
function generateBuildConfigWithDockerfilePath(
  config: BuildConfig,
  path: string,
): BuildConfig {
  const newConfig: BuildConfig = {};

  for (const key in config) {
    newConfig[key] = {
      ...config[key],
      dockerfilePath: generateDockerfilePath(path, config[key].dockerfile),
      contextPath: contextPath,
      label: i18next.t(config[key].label) as string, // 使用翻译字符串并断言为 string 类型
      ...(config[key].hint && {
        hint: i18next.t(config[key].hint as string) as string,
      }), // 添加翻译后的 hint 并断言为 string 类型
    };
  }

  return newConfig;
}

// 根据 Dockerfile 路径生成新的构建配置对象
export const buildConfig = generateBuildConfigWithDockerfilePath(
  baseBuildConfig,
  dockerfilesPath,
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
