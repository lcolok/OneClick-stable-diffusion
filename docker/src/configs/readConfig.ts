import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { GlobalConfigTypes } from '@types';
import { generateBuildConfigTypesWithDockerfilePath } from './imageBuildConfig';

// 获取配置文件路径
const configFile = path.join(__dirname, './globalConfig.yaml');

// 读取配置文件并解析为 TypeScript 类型
const parsedGlobalConfig = yaml.load(
  fs.readFileSync(configFile, 'utf8'),
) as GlobalConfigTypes;

// 从 dockerBuildConfig 中获取 endpointBuild 为 true 的项目，得知新的 buildList 列表
const buildList = Object.keys(parsedGlobalConfig.dockerBuildConfig).filter(
  (key) => parsedGlobalConfig.dockerBuildConfig[key].endpointBuild,
);

// 根据 Dockerfile 路径生成新的构建配置对象
const buildConfig =
  generateBuildConfigTypesWithDockerfilePath(parsedGlobalConfig);

// 根据构建配置对象生成项目选项数组
const projectOptions = Object.keys(buildConfig).map((key) => {
  const { label, hint, serviceOptions } = buildConfig[key];
  return {
    value: key,
    label,
    ...(hint && { hint }),
    ...(serviceOptions && { serviceOptions }),
  };
});

// 将 buildList 追加到 globalConfig 中
export const globalConfig: GlobalConfigTypes = {
  ...parsedGlobalConfig,
  buildList: buildList,
  buildConfig: buildConfig,
  projectOptions: projectOptions,
};
