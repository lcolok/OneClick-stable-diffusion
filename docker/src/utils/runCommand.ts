import { spawn, SpawnOptions } from "child_process";
import { outro, cancel } from "@clack/prompts";
import pc from "picocolors";
import i18next from '../i18n';

export async function runCommand(command: string, args: string[], options?: SpawnOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, { stdio: "inherit", ...options });

        // Handle Ctrl+C (SIGINT) signal
        process.on("SIGINT", () => {
            console.log(`\n${pc.bold(i18next.t("TERMINATING_CHILD_PROCESS"))}`);
            childProcess.kill();
            cancel(i18next.t("CHILD_PROCESS_TERMINATED") as string);
            process.exit(0);
        });

        childProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${i18next.t("CHILD_PROCESS_EXITED")} ${code}`));
            }
        });

        childProcess.on("error", (error) => {
            reject(error);
        });
    });
}