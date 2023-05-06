// 引入 Node.js 内置模块和第三方模块
import i18next from '@i18n';
import { BuildConfig } from '@types';
import { globalConfig } from '@configs';
import { path as projectRootDir } from 'app-root-path';
import path from 'path';

// 生成包含 Dockerfile 文件路径的新构建配置对象的函数
function generateBuildConfigWithDockerfilePath(options: {
  dockerBuildConfig: BuildConfig;
  dockerfilesDir: string;
  contextDir: string;
}): BuildConfig {
  const newConfig: BuildConfig = {};

  for (const [key, value] of Object.entries(options.dockerBuildConfig)) {
    const { dockerfile, hint, label } = value;
    newConfig[key] = {
      ...value,
      dockerfilePath: path.join(
        projectRootDir,
        options.dockerfilesDir,
        dockerfile,
      ),
      contextPath: path.join(projectRootDir, options.contextDir),
      label: i18next.t(label) as string,
      ...(hint && { hint: i18next.t(hint as string) as string }),
    };
  }
  return newConfig;
}

// 根据 Dockerfile 路径生成新的构建配置对象
export const buildConfig = generateBuildConfigWithDockerfilePath(globalConfig);

// 根据构建配置对象生成项目选项数组
export const projectOptions = Object.keys(buildConfig).map((key) => {
  const { label, hint } = buildConfig[key];
  return {
    value: key,
    label,
    ...(hint && { hint }),
  };
});
