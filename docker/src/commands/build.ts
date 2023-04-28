import { buildConfig, projectOptions } from "../utils/imageBuildConfigReader";
import { selectDependenciesAndBuildImages } from "../modules/imageBuilder";
import { printDockerImages } from "../utils/print";
import { select, isCancel, cancel, outro } from "@clack/prompts";
import i18next from '../i18n';

export async function buildImageSelection(): Promise<void> {
  async function selectProjectType(): Promise<string | symbol | null> {
    return await select({
      message: i18next.t("SELECT_PROJECT_TYPE"),
      options: projectOptions,
    });
  }
  const projectType: string | symbol | null = await selectProjectType();

  if (isCancel(projectType)) {
    cancel(i18next.t("OPERATION_CANCELLED")!);
    return process.exit(0);
  }

  const selectedConfig = buildConfig[projectType as string];


  if (selectedConfig) {
    await buildAction(selectedConfig)
  }
}

/**
 * 真正的构建动作函数
 * @param selectedConfig 选定的构建配置对象
 */
export async function buildAction(selectedConfig: any): Promise<void> {
  // 构建镜像
  await selectDependenciesAndBuildImages(selectedConfig);
  // 打印镜像信息
  await printDockerImages(selectedConfig);
  outro(i18next.t("BUILD_SUCCESSFULLY")!);
}
