import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";

import { spawn, SpawnOptions } from "child_process";
import pc from "picocolors";
import { BuildConfigType, buildConfig } from "../utils/imageBuildConfigReader";
import i18next from '../i18n';

// 创建一个通用函数用于构建镜像
export async function buildImage(
  tag: string,
  dockerfilepath: string,
  contextpath: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      stdio: ["pipe", "inherit", "inherit"],
    };

    console.log('\n',`docker build -t ${tag} -f ${dockerfilepath} ${contextpath}`, '\n');

    const buildProcess = spawn(
      "docker",
      ["build", "-t", tag, "-f", dockerfilepath, contextpath],
      spawnOptions
    );

    buildProcess.on("exit", (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${i18next.t("IMAGE_BUILD_FAILED", { tag })}`));
      }
    });
  });
}

export async function buildImagesRecursively(
  selectedConfig: BuildConfigType[keyof BuildConfigType]
): Promise<void> {
  if (!selectedConfig) {
    return;
  }

  // 如果有依赖项，则先构建依赖项
  if (selectedConfig.dependencies) {
    for (const dependency of selectedConfig.dependencies) {
      const depConfig = buildConfig[dependency];
      if (depConfig) {
        await buildImagesRecursively(depConfig);
      }
    }
  }

  // 构建当前方案
  const s = spinner();
  s.start(`${i18next.t("BUILDING_IMAGE_VIA_DOCKER", { tag: pc.green(pc.inverse(` ${selectedConfig.tag} `)) })}`);
  try {
    await buildImage(selectedConfig.tag, selectedConfig.dockerfilePath!, selectedConfig.contextPath!);
    s.stop(`${i18next.t("IMAGE_SUCCESSFULLY_BUILT_VIA_DOCKER", { tag: pc.green(pc.inverse(` ${selectedConfig.tag} `)) })}`);
  } catch (error: any) {
    console.error(pc.red(error.message));
    cancel(`${i18next.t("IMAGE_BUILD_FAILED", { tag: pc.red(pc.inverse(` ${selectedConfig.tag} `)) })}`);
    return process.exit(1);
  }
}
