import { ServiceOptions } from '@types';

export interface GlobalConfigTypes {
  dockerBuildConfig: BuildConfigTypes;
  buildList: string[];
  buildConfig: BuildConfigTypes;
  projectOptions: ProjectOption[];
}

// 新增 ProjectOption 接口
export interface ProjectOption {
  value: string;
  label: string;
  hint?: string;
  serviceOptions?: ServiceOptions;
}

// 定义构建配置类型
export interface BuildConfigTypes {
  [key: string]: {
    tag: string; // 镜像标签
    dockerfile: string; // Dockerfile 文件名
    label: string; // 项目标签
    hint?: string; // 项目提示
    dependencies: string[]; // 依赖列表
    endpointBuild?: boolean; // 是否为端点构建
    dockerfilesDir: string; // Dockerfile 文件夹路径
    absDockerfilePath: string; // 经过绝对路径处理的 Dockerfile 文件路径
    contextDir: string; // 构建上下文文件夹路径
    absContextPath: string; // 经过绝对路径处理的构建上下文路径
    serviceOptions: ServiceOptions;
  };
}

export interface BuildImageOptions {
  tag: string;
  absDockerfilePath: string;
  absContextPath: string;
  flags?: string[];
}

export interface BuildImagesRecursivelyOptions {
  selectedConfig: BuildConfigTypes[keyof BuildConfigTypes];
  buildFromScratchDependencies: Set<string>;
  builtDependencies?: Set<string>;
}

export interface BuildActionParams {
  selectedConfig: BuildConfigTypes[keyof BuildConfigTypes];
  selectedConfigKey: string;
}
