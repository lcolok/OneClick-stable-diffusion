import { runCommand, checkAndInstallNvitop } from '@utils';

export async function gpuMonitor(): Promise<void> {
  await checkAndInstallNvitop();
  await runCommand('nvitop', ['-m', 'auto', '--colorful']);
}
