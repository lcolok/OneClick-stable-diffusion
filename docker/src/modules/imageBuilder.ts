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

import { spawn, SpawnOptions } from "child_process";
import pc from "picocolors";
import { BuildConfigType, buildConfig } from "../utils/imageBuildConfigReader";
import i18next from '../i18n';

// 创建一个通用函数用于构建镜像

interface BuildImageOptions {
  tag: string;
  dockerfilePath: string;
  contextPath: string;
  flags?: string[];
}

// 创建一个通用函数用于构建镜像
export async function buildImage({
  tag,
  dockerfilePath,
  contextPath,
  flags = [],
}: BuildImageOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      stdio: ["pipe", "inherit", "inherit"],
    };

    const dockerCommand = ["build", "-t", tag, "-f", dockerfilePath, contextPath, ...flags];

    console.log("\n", `docker ${dockerCommand.join(" ")}`, "\n");

    const buildProcess = spawn("docker", dockerCommand, spawnOptions);

    buildProcess.on("exit", (code: number) => {
      // 移除 SIGINT 事件监听器
      process.removeListener("SIGINT", handleSigInt);

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(i18next.t("IMAGE_BUILD_FAILED", { tag }) as string));
      }
    });

    // 将 SIGINT 事件处理程序定义为单独的函数，以便在需要时移除
    function handleSigInt() {
      buildProcess.kill();
      // 显示取消消息
      reject(new Error(i18next.t("OPERATION_CANCELLED") as string));
    }

    // 监听 SIGINT 事件，结束构建进程
    process.on("SIGINT", handleSigInt);
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
    await buildImage({
      tag: selectedConfig.tag,
      dockerfilePath: selectedConfig.dockerfilePath!,
      contextPath: selectedConfig.contextPath!,
    });
    s.stop(`${i18next.t("IMAGE_SUCCESSFULLY_BUILT_VIA_DOCKER", { tag: pc.green(pc.inverse(` ${selectedConfig.tag} `)) })}`);
  } catch (error: any) {
    console.error(pc.red(error.message));
    cancel(`${i18next.t("IMAGE_BUILD_FAILED", { tag: pc.red(pc.inverse(` ${selectedConfig.tag} `)) })}`);
    return process.exit(1);
  }
}