import { BuildConfigType, buildConfig } from "./imageBuildConfigReader";
import pc from "picocolors";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import i18next from '../i18n';
import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text, multiselect
} from "@clack/prompts";

const exec = promisify(execCallback);

export async function printDockerImages(
  selectedConfig: BuildConfigType[keyof BuildConfigType]
) {
  const { stdout, stderr } = await exec("docker images");
  const images = stdout.split("\n").filter(Boolean);
  
  // 获取表头
  const header = images[0];
  
  // 使用正则表达式匹配表头格式并获取项目间隔
  const separator = header.match(/\s+/g)?.[0] ?? '  ';
  
  // 打印表头
  console.log(pc.inverse(`${header}  `));
  
  // 过滤掉名称或标签为<none>的镜像
  const filteredImages = images.slice(1).filter((image) => !image.startsWith('<none>'));
  
  filteredImages.forEach((image) => {
    const [repository, tag, imageId, created, size] = image.split(separator);
    const name = `${repository}:${tag}`;
    if (name === selectedConfig.tag) {
      console.log(pc.bold(pc.cyan(image)));
    } else {
      console.log(image);
    }
  });
}
