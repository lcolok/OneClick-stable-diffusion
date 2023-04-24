import { BuildConfigType, buildConfig } from "./utils/configReader";
import pc from "picocolors";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
const exec = promisify(execCallback);

export async function printDockerImages(
  selectedConfig: BuildConfigType[keyof BuildConfigType]
) {
  const { stdout, stderr } = await exec("docker images");
  console.log();
  console.log(pc.bold("所有 Docker 镜像列表："));
  const images = stdout.split("\n").slice(1).filter(Boolean);
  images.forEach((image) => {
    const [repository, tag, imageId, created, size] = image.split(/\s+/);
    const name = `${repository}:${tag}`;
    if (name === selectedConfig.tag) {
      console.log(pc.bold(pc.cyan(image)));
    } else {
      console.log(image);
    }
  });
}
