import { spawn, SpawnOptions, ChildProcessWithoutNullStreams } from "child_process";
import { outro, cancel } from "@clack/prompts";
import pc from "picocolors";
import i18next from '../i18n';

export function runCommand(command: string, args: string[], options?: SpawnOptions): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let childProcess: ChildProcessWithoutNullStreams | undefined;
        const pidList: number[] = [];

        function handleSIGINT() {
            console.log(`\n${pc.bold(i18next.t("TERMINATING_CHILD_PROCESS"))}`);
            for (const pid of pidList) {
                process.kill(pid);
            }
            cancel(i18next.t("CHILD_PROCESS_TERMINATED") as string);
        }

        const signalHandler = () => {
            handleSIGINT();
            process.removeListener('SIGINT', signalHandler);
        };

        process.on("SIGINT", signalHandler);

        try {
            childProcess = spawn(command, args, { stdio: ["inherit", "inherit", "pipe"], ...options }) as ChildProcessWithoutNullStreams;
            if (childProcess?.pid) {
                pidList.push(childProcess.pid);
            }
        } catch (error) {
            reject(error);
        }

        childProcess?.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${i18next.t("CHILD_PROCESS_EXITED")} ${code}`));
            }
        });

        childProcess?.on("error", (error) => {
            reject(error);
        });
    });
}