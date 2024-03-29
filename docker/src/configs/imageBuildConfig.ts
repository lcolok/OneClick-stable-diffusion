// 引入 Node.js 内置模块和第三方模块
import i18next from '@i18n';
import { BuildConfigTypes } from '@types';
import { path as projectRootDir } from 'app-root-path';
import path from 'path';

// 生成包含 Dockerfile 文件路径的新构建配置对象的函数
export function generateBuildConfigTypesWithDockerfilePath(options: {
  dockerBuildConfig: BuildConfigTypes;
}): BuildConfigTypes {
  const newConfig: BuildConfigTypes = {};

  for (const [key, value] of Object.entries(options.dockerBuildConfig)) {
    const { dockerfile, hint, label, dockerfilesDir, contextDir } = value;
    newConfig[key] = {
      ...value,
      absDockerfilePath: path.join(projectRootDir, dockerfilesDir, dockerfile),
      absContextPath: path.join(projectRootDir, contextDir),
      label: i18next.t(label) as string,
      ...(hint && { hint: i18next.t(hint as string) as string }),
    };
  }
  return newConfig;
}
