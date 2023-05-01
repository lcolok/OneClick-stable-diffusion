import i18next from '@i18n';
import { exec, execSync, spawn, SpawnOptions } from 'child_process';

// 检查并安装 screen
export async function checkAndInstallScreen(): Promise<void> {
  try {
    execSync('screen --version', { stdio: 'ignore' });
  } catch (error) {
    console.log(i18next.t('SCREEN_NOT_FOUND'));
    try {
      execSync('sudo apt-get update && sudo apt-get install -y screen', {
        stdio: 'inherit',
      });
      console.log(i18next.t('SCREEN_INSTALLED_SUCCESSFULLY'));
    } catch (installError) {
      console.error(i18next.t('SCREEN_INSTALLATION_FAILED'));
      throw installError;
    }
  }
}
