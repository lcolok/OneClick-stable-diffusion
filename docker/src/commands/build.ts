import { buildConfig, projectOptions, BuildConfigType } from '@utils';
import { selectDependenciesAndBuildImages } from '@modules/imageBuilder';
import { printDockerImages } from '@utils';
import { select, isCancel, cancel, outro } from '@clack/prompts';
import i18next from '@i18n';

interface BuildActionParams {
  selectedConfig: BuildConfigType[keyof BuildConfigType];
  selectedConfigKey: string;
}

export async function buildImageSelection(): Promise<void> {
  async function selectProjectType(): Promise<string | symbol | null> {
    return await select({
      message: i18next.t('SELECT_PROJECT_TYPE'),
      options: projectOptions,
    });
  }
  const selectedConfigKey = (await selectProjectType()) as string;

  if (isCancel(selectedConfigKey)) {
    cancel(i18next.t('OPERATION_CANCELLED')!);
    return process.exit(0);
  }

  const selectedConfig = buildConfig[selectedConfigKey];

  if (selectedConfig && selectedConfigKey) {
    await buildAction({ selectedConfig, selectedConfigKey });
  }
}

export async function buildAction({
  selectedConfig,
  selectedConfigKey,
}: BuildActionParams): Promise<void> {
  // 构建镜像
  await selectDependenciesAndBuildImages({ selectedConfig, selectedConfigKey });
  // 打印镜像信息
  await printDockerImages(selectedConfig);
  outro(i18next.t('BUILD_SUCCESSFULLY')!);
}
