import { outro } from '@clack/prompts';
import pc from 'picocolors';

import { runCommand } from '@utils';
import i18next from '@i18n';

export async function clean(): Promise<void> {
  console.log(i18next.t('CLEANING_DOCKER_RESOURCES'));
  const command = 'docker';
  const args = ['system', 'prune', '--force'];

  try {
    await runCommand(command, args);
    // console.log("Docker 资源清理完毕。");
    outro(pc.green(i18next.t('DOCKER_RESOURCES_CLEANED_SUCCESSFULLY')));
  } catch (error) {
    console.error(
      `${i18next.t('ERROR_CLEANING_DOCKER_RESOURCES')}: ${
        (error as Error).message
      }`,
    );
  }
}
