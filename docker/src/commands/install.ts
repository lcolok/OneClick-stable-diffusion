import { installAutoLauncher } from '../modules/installAutoLauncher';
import i18next from '../i18n';

export async function install(): Promise<void> {
  installAutoLauncher()
    .then(() => console.log(i18next.t("AUTO_LAUNCHER_INSTALLED_SUCCESSFULLY")))
    .catch((error) => console.error(`${i18next.t("ERROR_INSTALLING_AUTO_LAUNCHER")}: ${error}`));
}