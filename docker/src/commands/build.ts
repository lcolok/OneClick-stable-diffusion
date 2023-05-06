import { buildAction } from '@utils';
import { globalConfig } from '@configs';
import { select, isCancel, cancel } from '@clack/prompts';
import i18next from '@i18n';

export async function buildImageSelection(): Promise<void> {
  async function selectProjectType(): Promise<string | symbol | null> {
    return await select({
      message: i18next.t('SELECT_PROJECT_TYPE'),
      options: globalConfig.projectOptions,
    });
  }
  const selectedConfigKey = (await selectProjectType()) as string;

  if (isCancel(selectedConfigKey)) {
    cancel(i18next.t('OPERATION_CANCELLED')!);
    return process.exit(0);
  }

  const selectedConfig = globalConfig.buildConfig[selectedConfigKey];

  if (selectedConfig && selectedConfigKey) {
    await buildAction({ selectedConfig, selectedConfigKey });
  }
}
