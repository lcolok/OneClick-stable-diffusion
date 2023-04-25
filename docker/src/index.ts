import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";

import { setTimeout as sleep } from "node:timers/promises";
import pc from "picocolors";
import { buildImageSelection } from "./commands/build";
import { launchContainer } from "./commands/launch";
import { install } from "./commands/install";
import { clean } from "./commands/clean";
import { selectMenu } from "./utils/menuSelection";

async function main(): Promise<void> {
  intro(pc.inverse(" 简易构建容器镜像 "));

  const selectedOperation = await selectMenu({
    message: "请选择一个操作：",
    operations: [
      {
        label: "🚀启动容器",
        hint: pc.bold(pc.yellow("执行docker-compose.yaml")),
        action: launchContainer,
      },
      {
        label: "🛠️构建镜像",
        hint: pc.bold(pc.yellow("推荐")),
        action: buildImageSelection,
      },
      {
        label: "🔌安装开机自启服务",
        hint: pc.bold(pc.yellow("运行autolaunch.py")),
        action: install,
      },
      {
        label: "🧹清理多余的镜像",
        action: clean,
      },
    ],
  });

  if (selectedOperation?.action) {
    await selectedOperation.action();
  }
}

main().catch(console.error);
