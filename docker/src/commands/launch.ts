import * as pc from 'picocolors';
import { selectMenu } from '@utils';
import i18next from '@i18n';
import { launchTestImage, launchProductionImage } from '@modules';

export async function launchContainer(): Promise<void> {
  const selectedOperation = await selectMenu({
    message: i18next.t('SELECT_CONTAINER_TO_LAUNCH'),
    operations: [
      {
        label: i18next.t('TEST_CONTAINER.LABEL'),
        action: launchTestImage,
      },
      {
        label: i18next.t('PRODUCTION_CONTAINER.LABEL'),
        hint: pc.bold(pc.yellow(i18next.t('PRODUCTION_CONTAINER.HINT'))),
        action: launchProductionImage,
      },
    ],
  });

  if (selectedOperation?.action) {
    await selectedOperation.action();
  }
}
