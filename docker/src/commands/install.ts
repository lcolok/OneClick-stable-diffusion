import { installAutoLauncher } from '../modules/installAutoLauncher';

export async function install(): Promise<void> {
  installAutoLauncher()
    .then(() => console.log('Auto launcher installed successfully.'))
    .catch((error) => console.error(`Error installing auto launcher: ${error}`));
}