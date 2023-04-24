import { buildConfig, projectOptions } from "../utils/configReader";
import { buildImagesRecursively } from "../modules/imageBuilder";
import { printDockerImages } from "../print";
import { select, isCancel, cancel } from "@clack/prompts";

export async function build(): Promise<void> {
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
