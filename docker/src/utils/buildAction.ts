import {
  selectDependenciesAndBuildImages,
  printDockerImages,
  BuildConfigType,
} from '@utils';
import i18next from '@i18n';
import { outro } from '@clack/prompts';

interface BuildActionParams {
  selectedConfig: BuildConfigType[keyof BuildConfigType];
  selectedConfigKey: string;
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
