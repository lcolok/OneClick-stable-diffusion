import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
  multiselect
} from "@clack/prompts";

import pc from "picocolors";
import { BuildConfigType, buildConfig, projectOptions } from "../utils/imageBuildConfigReader";
import i18next from '../i18n';
import { runCommand } from '../utils/runCommand';

// 创建一个通用函数用于构建镜像

interface BuildImageOptions {
  tag: string;
  dockerfilePath: string;
  contextPath: string;
  flags?: string[];
}

export async function buildImage({
  tag,
  dockerfilePath,
  contextPath,
  flags = [],
}: BuildImageOptions): Promise<void> {
  await runCommand("docker", ["build", "-t", tag, "-f", dockerfilePath, contextPath, ...flags]);
}

interface BuildImagesRecursivelyOptions {
  selectedConfig: BuildConfigType[keyof BuildConfigType];
  buildFromScratchDependencies: Set<string>;
  builtDependencies?: Set<string>;
}

/**
 * 递归构建镜像。
 * 
 * @param selectedConfig 选定的构建配置
 * @param buildFromScratchDependencies 需要从头构建的依赖项集合
 * @param builtDependencies 已经构建的依赖项集合，默认为空集合
 */
export async function buildImagesRecursively({
  selectedConfig,
  buildFromScratchDependencies,
  builtDependencies = new Set(),
}: BuildImagesRecursivelyOptions): Promise<void | null> {
  if (!selectedConfig) {
    return;
  }

  // 如果有依赖项，则先构建依赖项
  if (selectedConfig.dependencies) {
    for (const dependency of selectedConfig.dependencies) {
      const depConfig = buildConfig[dependency];
      if (depConfig && !builtDependencies.has(dependency)) {
        // 如果依赖项未被构建，则递归构建依赖项
        await buildImagesRecursively({
          selectedConfig: depConfig,
          buildFromScratchDependencies,
          builtDependencies,
        });
        builtDependencies.add(dependency); // 将已经构建过的依赖项添加到集合中
      }
    }
  }

  const s = spinner();
  let noCacheFlag: string[] = [];
  if (buildFromScratchDependencies.has(selectedConfig.tag)) {
    console.log(pc.red(pc.inverse(` 需要重新构建${selectedConfig.tag}! `)));
    noCacheFlag = ["--no-cache"];
  }

  // 使用 Spinner 提示正在构建的镜像
  s.start(`${i18next.t("BUILDING_IMAGE_VIA_DOCKER", { tag: pc.green(pc.inverse(` ${selectedConfig.tag} `)) })}`);
  try {
    // 调用 buildImage 函数构建镜像
    await buildImage({
      tag: selectedConfig.tag,
      dockerfilePath: selectedConfig.dockerfilePath!,
      contextPath: selectedConfig.contextPath!,
      flags: noCacheFlag,
    });
    // 使用 Spinner 提示镜像构建成功
    s.stop(`${i18next.t("IMAGE_SUCCESSFULLY_BUILT_VIA_DOCKER", { tag: pc.green(pc.inverse(` ${selectedConfig.tag} `)) })}`);
  } catch (error: any) {
    console.error(pc.red(error.message));
    // 如果构建失败，则提示用户并返回 null
    cancel(`${i18next.t("IMAGE_BUILD_FAILED", { tag: pc.red(pc.inverse(` ${selectedConfig.tag} `)) })}`);
    return process.exit(1);
  }
}

interface SelectDependenciesAndBuildImagesParams {
  selectedConfig: BuildConfigType[keyof BuildConfigType];
  selectedConfigKey: string;
}

export async function selectDependenciesAndBuildImages({ selectedConfig, selectedConfigKey }: SelectDependenciesAndBuildImagesParams) {
  if (!selectedConfig || !selectedConfig.dependencies) {
    return;
  }

  const dependencyOptions = [
    ...selectedConfig.dependencies,
    selectedConfigKey,
  ].map(dep => {
    const tag = buildConfig[dep].tag;
    const label = buildConfig[dep].label;
    return {
      value: tag,
      label: label,
      hint: dep === selectedConfigKey ? pc.yellow(i18next.t('CURRENT_CHOICE')) : undefined, // Add a hint for the selected config
    };
  });

  return new Promise(async (resolve, reject) => {
    const selectedDependencies = await multiselect({
      message: i18next.t("SELECT_DEPENDENCIES_TO_BUILD_FROM_SCRATCH"),
      options: dependencyOptions,
      required: false,
    });

    // 检查用户是否取消了选择
    if (isCancel(selectedDependencies)) {
      // 如果用户取消选择，显示取消信息并返回 null
      cancel(i18next.t("OPERATION_CANCELLED")!);
      return reject();
    }

    resolve(
      await buildImagesRecursively({
        selectedConfig,
        buildFromScratchDependencies: new Set(selectedDependencies as string[]),
      })
    );
  });
}
