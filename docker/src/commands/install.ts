import { installAutoLauncher } from '@modules';
import i18next from '@i18n';

export async function install(): Promise<void> {
  await installAutoLauncher();
}
