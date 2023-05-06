import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { BuildConfig } from '@types';

// 获取配置文件路径
const configFile = path.join(__dirname, './globalConfig.yaml');

// 读取配置文件并解析为 TypeScript 类型
export const globalConfig = yaml.load(fs.readFileSync(configFile, 'utf8')) as {
  dockerfilesDir: string; // Dockerfile 路径
  contextDir: string; // 构建上下文路径
  baseBuildConfig: BuildConfig; // 构建配置对象
  targetBuilds: string[]; // 目标构建
};
