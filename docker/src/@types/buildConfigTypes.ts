import { SelectOptions } from '@clack/prompts';

export interface GlobalConfigTypes {
  dockerfilesDir: string;
  contextDir: string;
  dockerBuildConfig: BuildConfigTypes;
  buildList: string[];
  buildConfig: BuildConfigTypes;
  projectOptions: SelectOptions<any, string> extends { options: infer O }
    ? O
    : never;
}

// 定义构建配置类型
export interface BuildConfigTypes {
  [key: string]: {
    tag: string; // 镜像标签
    dockerfile: string; // Dockerfile 文件名
    launchDockerfile: string; // 启动 Dockerfile 文件名
    dockerfilePath: string; // Dockerfile 文件路径
    contextPath: string; // 构建上下文路径
    label: string; // 项目标签
    hint?: string; // 项目提示
    dependencies: string[]; // 依赖列表
    endpointBuild?: boolean; // 是否为端点构建
  };
}

export interface BuildImageOptions {
  tag: string;
  dockerfilePath: string;
  contextPath: string;
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
