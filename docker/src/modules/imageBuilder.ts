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
import { BuildConfigType, buildConfig } from "../utils/imageBuildConfigReader";
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

export async function buildImagesRecursively(
  selectedConfig: BuildConfigType[keyof BuildConfigType],
  buildFromScratchDependencies: Set<string>
): Promise<void | null> {
  if (!selectedConfig) {
    return;
  }

  // 如果有依赖项，则先构建依赖项
  if (selectedConfig.dependencies) {
    for (const dependency of selectedConfig.dependencies) {
      const depConfig = buildConfig[dependency];
      if (depConfig) {
        await buildImagesRecursively(depConfig, buildFromScratchDependencies);
      }
    }
  }

  // 构建当前方案
  const s = spinner();
  const noCacheFlag = buildFromScratchDependencies.has(selectedConfig.tag) ? ["--no-cache"] : [];
  s.start(`${i18next.t("BUILDING_IMAGE_VIA_DOCKER", { tag: pc.green(pc.inverse(` ${selectedConfig.tag} `)) })}`);
  try {
    await buildImage({
      tag: selectedConfig.tag,
      dockerfilePath: selectedConfig.dockerfilePath!,
      contextPath: selectedConfig.contextPath!,
      flags: noCacheFlag,
    });
    s.stop(`${i18next.t("IMAGE_SUCCESSFULLY_BUILT_VIA_DOCKER", { tag: pc.green(pc.inverse(` ${selectedConfig.tag} `)) })}`);
  } catch (error: any) {
    console.error(pc.red(error.message));
    cancel(`${i18next.t("IMAGE_BUILD_FAILED", { tag: pc.red(pc.inverse(` ${selectedConfig.tag} `)) })}`);
    return process.exit(1);
  }
}

function handleSigInt(reject: (reason?: any) => void) {
  // 显示取消消息
  console.log(i18next.t("OPERATION_CANCELLED")!);
  process.exit(1);
}

export async function selectDependenciesAndBuildImages(
  selectedConfig: BuildConfigType[keyof BuildConfigType]
): Promise<void | null> {
  if (!selectedConfig || !selectedConfig.dependencies) {
    return;
  }

  const dependencyOptions = [
    ...selectedConfig.dependencies,
    selectedConfig.tag,
  ].map(dep => {
    const imageName = dep.split(':')[0]; // Extract the name of the image from the tag
    return {
      value: dep,
      label: imageName,
      hint: dep === selectedConfig.tag ? pc.yellow(i18next.t('CURRENT_CHOICE')) : undefined, // Add a hint for the selected config
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

    const buildFromScratchDependencies = new Set(selectedDependencies as string[]);
    resolve(await buildImagesRecursively(selectedConfig, buildFromScratchDependencies));
  });
}