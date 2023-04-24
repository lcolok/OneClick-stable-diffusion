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
import { build } from "./commands/build";
import { start } from "./commands/launch";
import { install } from "./commands/install";
import { clean } from "./commands/clean";

async function main(): Promise<void> {
  intro(pc.inverse(" 简易构建容器镜像 "));

  async function selectMainMenu(): Promise<string | symbol | null> {
    return await select({
      message: "请选择一个操作：",
      options: [
        { label: "🚀启动容器", value: "start", hint: pc.bold(pc.yellow("执行docker-compose.yaml")) },
        { label: "🛠️构建镜像", value: "build", hint: pc.bold(pc.yellow("推荐")) },
        { label: "🔌安装开机自启服务", value: "install", hint: pc.bold(pc.yellow("运行autolaunch.py")) },
        { label: "🧹清理多余的镜像", value: "clean" }
      ],
    });
  }

  const mainMenu: string | symbol | null = await selectMainMenu();

  if (isCancel(mainMenu)) {
    cancel("操作取消");
    return process.exit(0);
  }

  type ActionKey = 'build' | 'start' | 'install' | 'clean';
  const actions: Record<ActionKey, () => Promise<void>> = {
    build,
    start,
    install,
    clean
  };

  //...前面的代码保持不变

  const action = actions[mainMenu as ActionKey];
  if (action) {
    await action();
  }
}

main().catch(console.error);
