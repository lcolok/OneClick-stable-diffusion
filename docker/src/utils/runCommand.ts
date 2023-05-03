import { spawn, ChildProcess } from 'child_process';
import { cancel } from '@clack/prompts';
import { Writable } from 'stream';
import i18next from '@i18n';
import pc from 'picocolors';

const childProcesses = new Set<ChildProcess>();

interface RunCommandOptions {
  cwd?: string;
  inheritStdio?: boolean;
}

export async function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const inheritStdio = options?.inheritStdio ?? true;

    let stdout = '';
    let stderr = '';

    const childProcess = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: options?.cwd,
    });

    childProcess.stdout?.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      stdout += chunkStr;
      if (inheritStdio) {
        process.stdout.write(chunkStr);
      }
    });

    childProcess.stderr?.on('data', (chunk) => {
      const chunkStr = chunk.toString();
      stderr += chunkStr;
      if (inheritStdio) {
        process.stderr.write(chunkStr);
      }
    });

    childProcesses.add(childProcess);

    const onSigInt = () => {
      console.log(`\n${i18next.t('TERMINATING_CHILD_PROCESS')}`);
      childProcesses.forEach((cp) => cp.kill('SIGINT'));
      process.removeListener('SIGINT', onSigInt);
      setTimeout(() => {
        cancel(i18next.t('CHILD_PROCESS_TERMINATED') as string);
        process.exit(0);
      }, 200);
    };

    process.on('SIGINT', onSigInt);

    childProcess.on('close', (code) => {
      childProcesses.delete(childProcess);
      process.removeListener('SIGINT', onSigInt);

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${i18next.t('CHILD_PROCESS_EXITED')} ${code}`));
      }
    });
  });
}
