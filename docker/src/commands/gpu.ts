import { runCommand } from '@utils';
import i18next from '@i18n';

async function checkAndInstallNvitop(): Promise<void> {
  try {
    await runCommand('nvitop', ['--version']);
    console.log(i18next.t('NVITOP_ALREADY_INSTALLED'));
  } catch (error) {
    console.log(i18next.t('INSTALLING_NVITOP'));
    try {
      await runCommand('python3', ['-m', 'pip', 'install', 'nvitop']);
      console.log(i18next.t('NVITOP_SUCCESSFULLY_INSTALLED'));
    } catch (installError) {
      console.error(i18next.t('NVITOP_INSTALLATION_FAILED'));
      throw new Error(i18next.t('NVITOP_INSTALLATION_FAILED')!);
    }
  }
}

export async function gpuMonitor(): Promise<void> {
  await checkAndInstallNvitop();
  await runCommand('nvitop', ['-m', 'auto', '--colorful']);
}
