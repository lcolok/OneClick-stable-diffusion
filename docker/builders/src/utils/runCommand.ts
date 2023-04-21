import { spawn, SpawnOptions } from "child_process";
import { outro,cancel } from "@clack/prompts";
import pc from "picocolors";

export async function runCommand(command: string, args: string[], options?: SpawnOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, args, { stdio: "inherit", ...options });

        // 处理 Ctrl+C（SIGINT）信号
        process.on("SIGINT", () => {
            console.log("\n❗收到 ⌃C，正在终止子进程...");
            childProcess.kill();
            cancel("⛔ 已终止子进程");
            process.exit(0);
        });

        childProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`子进程退出，返回码：${code}`));
            }
        });

        childProcess.on("error", (error) => {
            reject(error);
        });
    });
}