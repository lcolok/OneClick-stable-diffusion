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

import { spawn } from "child_process";
import pc from "picocolors";
import { BuildConfigType, buildConfig } from "../utils/imageBuildConfigReader";

// 创建一个通用函数用于构建镜像
export async function buildImage(
  tag: string,
  dockerfilepath: string,
  contextpath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn("docker", [
      "build",
      "-t",
      tag,
      "-f",
      dockerfilepath,
      contextpath,
    ]);

    buildProcess.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    buildProcess.stderr.on("data", (data) => {
      console.error(pc.green(data.toString()));
    });

    buildProcess.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`镜像 ${tag} 构建失败`));
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
  s.start(`通过 Docker 构建 ${selectedConfig.tag} 镜像`);
  try {
    await buildImage(selectedConfig.tag, selectedConfig.dockerfilePath!,selectedConfig.contextPath!);
    s.stop(`${selectedConfig.tag} 镜像已成功通过 Docker 构建`);
  } catch (error: any) {
    console.error(pc.red(error.message));
    cancel(`${selectedConfig.tag} 镜像构建失败`);
    return process.exit(1);
  }
}
