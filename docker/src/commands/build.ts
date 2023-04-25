import { buildConfig, projectOptions } from "../utils/configReader";
import { buildImagesRecursively } from "../modules/imageBuilder";
import { printDockerImages } from "../print";
import { select, isCancel, cancel } from "@clack/prompts";

export async function buildImageSelection(): Promise<void> {
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

  if (selectedConfig) {
    await buildImagesRecursively(selectedConfig);
    await printDockerImages(selectedConfig);
  }
}

/**
 * 真正的构建动作函数
 * @param selectedConfig 选定的构建配置对象
 */
export async function buildAction(selectedConfig: any): Promise<void> {
  // 构建镜像
  await buildImagesRecursively(selectedConfig);

  // 打印镜像信息
  await printDockerImages(selectedConfig);
}