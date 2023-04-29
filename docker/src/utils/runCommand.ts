import { spawn, ChildProcess } from "child_process";
import { cancel } from "@clack/prompts";
import { Writable } from "stream";
import i18next from '@i18n';
import pc from "picocolors";

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

export interface RunProcessOptions {
    args: string[];
    cwd?: string;
    onStdOut?: (data: string) => void;
    onStdErr?: (data: string) => void;
}

export function runProcess({
    args,
    cwd,
    onStdOut = console.log,
    onStdErr = console.error,
}: RunProcessOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const process: ChildProcess = spawn(args[0], args.slice(1), {
            cwd,
        });

        process.stdout?.on("data", (data) => {
            onStdOut(data.toString());
        });

        process.stderr?.on("data", (data) => {
            onStdErr(pc.blue(data.toString()));
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`The command "${args.join(" ")}" failed with exit code ${code}`));
            }
        });
    });
}