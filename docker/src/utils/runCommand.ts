import { spawn, ChildProcess } from 'child_process';
import { Writable } from 'stream';

interface RunCommandOptions {
  cwd?: string;
  captureOutput?: boolean;
  captureError?: boolean;
  inheritStdio?: boolean;
}

export async function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions,
): Promise<{ stdout: string | void; stderr: string | void }> {
  return new Promise<{ stdout: string | void; stderr: string | void }>(
    (resolve, reject) => {
      const captureOutput = options?.captureOutput ?? false;
      const captureError = options?.captureError ?? false;
      const inheritStdio = options?.inheritStdio ?? true;

      const stdoutStream: Writable = captureOutput
        ? new Writable({
            write(chunk, encoding, callback) {
              resolve({ stdout: chunk.toString(), stderr: undefined });
              callback();
            },
          })
        : process.stdout;

      const stderrStream: Writable = captureError
        ? new Writable({
            write(chunk, encoding, callback) {
              resolve({ stdout: undefined, stderr: chunk.toString() });
              callback();
            },
          })
        : process.stderr;

      const childProcess = spawn(command, args, {
        stdio: [
          'inherit',
          captureOutput ? 'pipe' : inheritStdio ? 'inherit' : 'ignore',
          captureError ? 'pipe' : inheritStdio ? 'inherit' : 'ignore',
        ],
        cwd: options?.cwd,
      });

      if (captureOutput) {
        childProcess.stdout?.pipe(stdoutStream);
      }

      if (captureError) {
        childProcess.stderr?.pipe(stderrStream);
      }

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout: undefined, stderr: undefined });
        } else {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });
    },
  );
}
