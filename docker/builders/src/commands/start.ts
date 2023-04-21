import { select, isCancel, cancel } from "@clack/prompts";
import path from "path";
import { spawn } from "child_process";
import * as pc from "picocolors";
import * as yaml from 'js-yaml';
import * as fs from 'fs';

async function runCommand(command: string, args: string[], cwd?: string): Promise<void> {
    const options = cwd ? { cwd } : undefined;
    const child = spawn(command, args, options);

    child.stdout.on("data", (data) => {
        console.log(pc.green(data.toString()));
    });

    child.stderr.on("data", (data) => {
        console.error(pc.red(data.toString()));
    });

    child.on("close", (code) => {
        if (code !== 0) {
            console.error(`${command} 进程退出码：${code}`);
        }
    });
}

async function startTestImage(): Promise<void> {
    const composeFilePath = path.join(process.cwd(), "../", "docker-compose.yaml");

    // 停止并删除旧的 Docker 容器
    console.log("正在停止并删除旧的 Docker 容器...");
    const downCommand = "docker-compose";
    const downArgs = ["-f", composeFilePath, "down"];
    await runCommand(downCommand, downArgs);
    console.log("旧的 Docker 容器已停止并删除。");

    // 启动新的测试镜像
    console.log("正在启动新的测试镜像...");
    const upCommand = "docker-compose";
    const upArgs = ["-f", composeFilePath, "up", "--build"];
    await runCommand(upCommand, upArgs);
}

async function startProductionImage(): Promise<void> {
    const dashFilePath = path.join(process.cwd(), "../");
    const command = "python3";
    const args = ["./dash.py", "--name", "autolaunch", "--port_increment", "1"];

    await runCommand(command, args, dashFilePath);
}


export async function start(): Promise<void> {
    async function selectStartOption(): Promise<string | symbol | null> {
        return await select({
            message: "请选择要启动的镜像类型：",
            options: [
                { label: "启动测试镜像", value: "test" },
                { label: "启动生产镜像", value: "production" },
            ],
        });
    }

    const startOption: string | symbol | null = await selectStartOption();

    if (isCancel(startOption)) {
        cancel("操作取消");
        return process.exit(0);
    }

    type StartOptionKey = 'test' | 'production';
    const startActions: Record<StartOptionKey, () => Promise<void>> = {
        test: startTestImage,
        production: startProductionImage,
    };

    const startAction = startActions[startOption as StartOptionKey];
    if (startAction) {
        await startAction();
    }
}
