import { select, isCancel, cancel } from "@clack/prompts";
import path from "path";
import * as pc from "picocolors";
import { runCommand } from "../utils/runCommand";
import { buildConfig } from "../utils/imageBuildConfigReader";
import { buildAction } from "./build";
import { selectMenu } from "../utils/menuSelection";
import { dockerComposeDown, dockerComposeUp } from "../utils/dockerUtils";

async function launchTestImage(): Promise<void> {
    const composeFilePath = path.join(process.cwd(), "./", "docker-compose.yaml");

    // 停止并删除旧的 Docker 容器
    console.log("正在停止并删除旧的 Docker 容器...");
    await dockerComposeDown(composeFilePath);
    console.log("旧的 Docker 容器已停止并删除。");

    // 构建新的镜像
    const selectedConfig = buildConfig["sdwebui_ext_build"];
    await buildAction(selectedConfig);

    // 启动新的测试容器
    console.log("正在启动新的测试容器...");
    await dockerComposeUp(composeFilePath, true);
}

async function launchProductionImage(): Promise<void> {
    const dashFilePath = path.join(process.cwd(), "./");
    const command = "python3";
    const args = ["./dash.py", "--name", "autolaunch", "--port_increment", "1"];

    await runCommand(command, args, { cwd: dashFilePath });
}

export async function launchContainer(): Promise<void> {
    const selectedOperation = await selectMenu({
        message: "要启动哪个容器呢?",
        operations: [
            {
                label: "🧪测试容器",
                action: launchTestImage,
            },
            {
                label: "🏭生产容器",
                hint: pc.bold(pc.yellow("部署服务面向用户")),
                action: launchProductionImage,
            },
        ],
    });

    if (selectedOperation?.action) {
        await selectedOperation.action();
    }
}
