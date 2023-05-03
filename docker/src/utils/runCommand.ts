import { spawn, ChildProcess } from 'child_process';
import { cancel } from '@clack/prompts';
import { Writable } from 'stream';
import i18next from '@i18n';
import pc from 'picocolors';

const childProcesses = new Set<ChildProcess>();

interface RunCommandOptions {
  cwd?: string;
  captureOutput?: boolean;
}

export async function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions,
): Promise<string | void> {
  return new Promise<string | void>((resolve, reject) => {
    const captureOutput = options?.captureOutput ?? false;

    const stdoutStream: Writable = captureOutput
      ? new Writable({
          write(chunk, encoding, callback) {
            resolve(chunk.toString());
            callback();
          },
        })
      : process.stdout;

    const childProcess = spawn(command, args, {
      stdio: ['inherit', captureOutput ? 'pipe' : 'inherit', 'inherit'],
      cwd: options?.cwd,
    });

    if (captureOutput) {
      childProcess.stdout?.pipe(stdoutStream);
    }

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

    childProcess.on('error', (error) => {
      reject(error);
    });

    childProcess.on('close', (code) => {
      childProcesses.delete(childProcess);
      process.removeListener('SIGINT', onSigInt);

      if (code === 0) {
        resolve(captureOutput ? undefined : '');
      } else {
        reject(new Error(`${i18next.t('CHILD_PROCESS_EXITED')} ${code}`));
      }
    });
  });
}
