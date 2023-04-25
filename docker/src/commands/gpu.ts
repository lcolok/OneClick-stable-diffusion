import { runCommand } from '../utils/runCommand';

async function checkAndInstallNvitop(): Promise<void> {
  try {
    await runCommand('nvitop', ['--version']);
    console.log('Nvitop is already installed.');
  } catch (error) {
    console.log('Nvitop is not installed. Installing now...');
    try {
      await runCommand('python', ['-m', 'pip', 'install', 'nvitop']);
      console.log('Nvitop successfully installed.');
    } catch (installError) {
      console.error('Failed to install Nvitop.');
      throw new Error('Failed to install Nvitop.');
    }
  }
}

export async function gpuMonitor(): Promise<void> {
  await checkAndInstallNvitop();
  await runCommand('nvitop', ['-m', 'auto', '--colorful']);
}
