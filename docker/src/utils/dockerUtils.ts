import path from "path";
import { runCommand } from "./runCommand";

export async function dockerComposeDown(composeFilePath: string): Promise<void> {
    const downCommand = "docker-compose";
    const downArgs = ["-f", composeFilePath, "down"];
    await runCommand(downCommand, downArgs);
}

export async function dockerComposeUp(composeFilePath: string, build: boolean = false): Promise<void> {
    const upCommand = "docker-compose";
    const upArgs = ["-f", composeFilePath, "up"];
    if (build) {
        upArgs.push("--build");
    }
    await runCommand(upCommand, upArgs);
}
