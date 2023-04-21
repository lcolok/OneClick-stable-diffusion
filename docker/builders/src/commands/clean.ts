// src/commands/clean.ts
import { outro } from "@clack/prompts";
import pc from "picocolors";

import { runCommand } from "../utils/runCommand";

export async function clean(): Promise<void> {
  console.log("正在清理无用的 Docker 资源...");
  const command = "docker";
  const args = ["system", "prune", "--force"];

  try {
    await runCommand(command, args);
    // console.log("Docker 资源清理完毕。");
    outro(pc.green("🧹🔜👌 Docker 资源清理完毕。"));
  } catch (error) {
    console.error(`清理 Docker 资源时出错：${(error as Error).message}`);
  }
}
