// 定义构建配置类型
export interface BuildConfig {
  [key: string]: {
    tag: string; // 镜像标签
    dockerfile: string; // Dockerfile 文件名
    launchDockerfile?: string; // 启动 Dockerfile 文件名
    dockerfilePath?: string; // Dockerfile 文件路径
    contextPath?: string; // 构建上下文路径
    targetBuild?: string; // 目标构建
    label: string; // 项目标签
    hint?: string; // 项目提示
    dependencies?: string[]; // 依赖列表
  };
}

export interface BuildImageOptions {
  tag: string;
  dockerfilePath: string;
  contextPath: string;
  flags?: string[];
}

export interface BuildImagesRecursivelyOptions {
  selectedConfig: BuildConfig[keyof BuildConfig];
  buildFromScratchDependencies: Set<string>;
  builtDependencies?: Set<string>;
}

export interface BuildActionParams {
  selectedConfig: BuildConfig[keyof BuildConfig];
  selectedConfigKey: string;
}
