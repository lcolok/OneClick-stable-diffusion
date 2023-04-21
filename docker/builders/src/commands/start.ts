import { select, isCancel, cancel } from "@clack/prompts";
import path from "path";
import * as pc from "picocolors";
import { runCommand } from "../utils/runCommand";


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

    await runCommand(command, args, { cwd: dashFilePath });
}


export async function start(): Promise<void> {
    async function selectStartOption(): Promise<string | symbol | null> {
        return await select({
            message: "请选择要启动的镜像类型：",
            options: [
                { label: "🧪测试镜像", value: "test" },
                { label: "🏭生产镜像", value: "production", hint: "(部署服务面向用户)" },
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
