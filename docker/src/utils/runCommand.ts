import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { cancel } from '@clack/prompts';
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
  return new Promise<{ stdout: string; stderr: string }>(async (resolve, reject) => {
    const inheritStdio = options?.inheritStdio ?? true;
    const outputFile = path.join(os.tmpdir(), `runCommand_output_${Date.now()}.txt`);

    const commandWithScript = `script -q -e -c "${command} ${args.join(' ')}" ${outputFile}`;

    const childProcess = spawn(commandWithScript, [], {
      stdio: inheritStdio ? 'inherit' : 'ignore',
      cwd: options?.cwd,
      shell: true,
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

    childProcess.on('close', async (code) => {
      childProcesses.delete(childProcess);
      process.removeListener('SIGINT', onSigInt);

      if (code === 0) {
        try {
          const output = await fs.readFile(outputFile, 'utf8');
          await fs.unlink(outputFile);
          resolve({ stdout: output, stderr: '' });
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`${i18next.t('CHILD_PROCESS_EXITED')} ${code}`));
      }
    });
  });
}
