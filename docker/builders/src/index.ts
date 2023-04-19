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
import { buildConfig } from "./config";
import { buildImagesRecursively } from "./build";
import { printDockerImages } from "./print";

async function main(): Promise<void> {
  console.log();
  intro(pc.inverse(" 简易构建容器镜像 "));

  const projectType: string | symbol | null = await select({
    message: "选择一个构建方案：",
    options: [
      {
        value: "conda_build",
        label: "构建Conda镜像",
        hint: "基于nvidia/cuda:11.8.0-cudnn8-devel-ubuntu22.04镜像，包含MiniConda、JupyterLab、Openbayes主题",
      },
      {
        value: "py_build",
        label: "构建Python镜像",
        hint: "包含Python3.10.6和Pytorch2.0.0",
      },
      {
        value: "sdwebui_base_build",
        label: "构建Stable Diffusion WebUI基本镜像",
      },
      {
        value: "sdwebui_ext_build",
        label: "构建Stable Diffusion WebUI附带常用插件的镜像",
        hint: "包含汉化、图库浏览器、ControlNet等",
      },
    ],
  });

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

  outro("You're all set!");
}

main().catch(console.error);
