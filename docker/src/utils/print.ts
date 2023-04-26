import { BuildConfigType, buildConfig } from "./imageBuildConfigReader";
import pc from "picocolors";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import i18next from '../i18n';

const exec = promisify(execCallback);

export async function printDockerImages(
  selectedConfig: BuildConfigType[keyof BuildConfigType]
) {
  const { stdout, stderr } = await exec("docker images");
  console.log();
  console.log(pc.bold(i18next.t("ALL_DOCKER_IMAGES_LIST")));
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