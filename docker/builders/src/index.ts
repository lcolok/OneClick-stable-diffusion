// Run `npm start` to start the demo
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

import { setTimeout as sleep } from "node:timers/promises";
import pc from "picocolors";
import { buildConfig, projectOptions } from "./config";
import { buildImagesRecursively } from "./build";
import { printDockerImages } from "./print";

async function main(): Promise<void> {
  intro(pc.inverse(" 简易构建容器镜像 "));

  // 选择构建方案的函数
  async function selectProjectType(): Promise<string | symbol | null> {
    return await select({
      message: "选择一个构建方案：",
      options: projectOptions,
    });
  }
  const projectType: string | symbol | null = await selectProjectType();

  if (isCancel(projectType)) {
    cancel("操作取消");
    return process.exit(0);
  }

  const selectedConfig = buildConfig[projectType as string];

  // 在 main 函数中调用 buildImagesRecursively 函数
  if (selectedConfig) {
    await buildImagesRecursively(selectedConfig);
    await printDockerImages(selectedConfig);
  }

  outro(pc.bold(pc.yellow("构建完成")));
}

main().catch(console.error);
