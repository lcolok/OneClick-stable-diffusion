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
import { promisify } from "util";
import { exec as execCallback } from "child_process";
const exec = promisify(execCallback);
import { spawn } from "child_process";

// 创建一个通用函数用于构建镜像
async function buildImage(tag: string, dockerfile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn("docker", [
      "build",
      "-t",
      tag,
      "-f",
      `../dockerfile/${dockerfile}`,
      "../",
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

  type BuildConfigType = {
    [key: string]: {
      tag: string;
      dockerfile: string;
      dependencies?: string[];
    };
  };

  async function printDockerImages(
    selectedConfig: BuildConfigType[keyof BuildConfigType]
  ) {
    const { stdout, stderr } = await exec("docker images");
    console.log();
    console.log(pc.bold("所有 Docker 镜像列表："));
    const images = stdout.split("\n").slice(1).filter(Boolean);
    images.forEach((image) => {
      const [repository, tag, imageId, created, size] = image.split(/\s+/);
      const name = `${repository}:${tag}`;
      if (name === selectedConfig.tag) {
        console.log(pc.bold(pc.cyan(image)));
      } else {
        console.log(image);
      }
    });
  }

  const buildConfig: BuildConfigType = {
    conda_build: {
      tag: "conda:jupyter",
      dockerfile: "Dockerfile.conda",
    },
    py_build: {
      tag: "py:3.10.6-torch2.0.0",
      dockerfile: "Dockerfile.py",
      dependencies: ["conda_build"],
    },
    sdwebui_base_build: {
      tag: "sdwebui_base:rtx4090",
      dockerfile: "Dockerfile.sdwebui_base",
      dependencies: ["conda_build", "py_build"],
    },
    sdwebui_ext_build: {
      tag: "sdwebui_ext:rtx4090",
      dockerfile: "Dockerfile.sdwebui_ext",
      dependencies: ["conda_build", "py_build", "sdwebui_base_build"],
    },
  };

  const selectedConfig = buildConfig[projectType as string];

  async function buildImagesRecursively(projectType: string): Promise<void> {
    const selectedConfig = buildConfig[projectType];
    if (!selectedConfig) {
      return;
    }

    // 如果有依赖项，则先构建依赖项
    if (selectedConfig.dependencies) {
      for (const dependency of selectedConfig.dependencies) {
        await buildImagesRecursively(dependency);
      }
    }

    // 构建当前方案
    const s = spinner();
    s.start(`通过Docker构建${selectedConfig.tag}镜像`);
    try {
      await buildImage(selectedConfig.tag, selectedConfig.dockerfile);
      s.stop(`${selectedConfig.tag}镜像已成功通过Docker构建`);
    } catch (error: any) {
      console.error(pc.red(error.message));
      cancel(`${selectedConfig.tag}镜像构建失败`);
      return process.exit(1);
    }
  }

  // 在 main 函数中调用 buildImagesRecursively 函数
  if (selectedConfig) {
    await buildImagesRecursively(projectType as string);
    await printDockerImages(selectedConfig);
  }

  outro("You're all set!");
}

main().catch(console.error);

// const name: string | symbol | null = await text({
//   message: "What is your name?",
//   placeholder: "Anonymous",
// });

// if (isCancel(name)) {
//   cancel("Operation cancelled");
//   return process.exit(0);
// }

// const shouldContinue: boolean | symbol | null = await confirm({
//   message: "Do you want to continue?",
// });

// if (isCancel(shouldContinue)) {
//   cancel("Operation cancelled");
//   return process.exit(0);
// }
