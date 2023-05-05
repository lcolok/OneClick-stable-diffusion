import i18next from '@i18n';
import { runCommand } from '@utils';

// 检查并安装 screen
export async function checkAndInstallScreen(): Promise<void> {
  try {
    await runCommand('screen', ['--version']);
  } catch (error) {
    console.log(i18next.t('SCREEN_NOT_FOUND'));
    try {
      await runCommand('sudo', ['apt-get', 'update']);
      await runCommand('sudo', ['apt-get', 'install', '-y', 'screen']);
      console.log(i18next.t('SCREEN_INSTALLED_SUCCESSFULLY'));
    } catch (installError) {
      console.error(i18next.t('SCREEN_INSTALLATION_FAILED'));
      throw installError;
    }
  }
}

export async function checkAndInstallNvitop(): Promise<void> {
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
