import { spawn, ChildProcess } from "child_process";
import { cancel } from "@clack/prompts";
import { Writable } from "stream";
import i18next from '../i18n';

const childProcesses = new Set<ChildProcess>();

interface RunCommandOptions {
    cwd?: string;
}

export async function runCommand(
    command: string,
    args: string[],
    options?: RunCommandOptions
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const childProcess = spawn(command, args, {
            stdio: ["pipe", "inherit", "inherit"],
            cwd: options?.cwd,
        });

        childProcesses.add(childProcess);

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.pipe(childProcess.stdin as Writable);
            process.stdin.on("data", (data) => {
                if (data.toString() === "\x03") {
                    process.stdin.unpipe(childProcess.stdin as Writable);
                    childProcess.stdin && childProcess.stdin.destroy();
                    console.log(`\n${i18next.t("TERMINATING_CHILD_PROCESS")}`);
                    childProcesses.forEach((cp) => cp.kill());
                    cancel(i18next.t("CHILD_PROCESS_TERMINATED") as string);
                    process.exit(0);
                }
            });
        }

        childProcess.on("close", (code) => {
            childProcesses.delete(childProcess);

            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${i18next.t("CHILD_PROCESS_EXITED")} ${code}`));
            }
        });
    });
}
