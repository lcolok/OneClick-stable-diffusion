import { BuildConfigTypes } from '@types';
import pc from 'picocolors';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import i18next from '@i18n';

const exec = promisify(execCallback);

export async function printDockerImages(
  selectedConfig: BuildConfigTypes[keyof BuildConfigTypes],
) {
  const { stdout, stderr } = await exec('docker images');
  const images = stdout.split('\n').filter(Boolean);

  // 获取表头
  const header = images[0];

  // 打印表头
  console.log(); // 加一个空行
  console.log(pc.inverse(`${header}  `));

  // 过滤掉名称或标签为<none>的镜像
  const filteredImages = images
    .slice(1)
    .filter((image) => !image.startsWith('<none>'));

  filteredImages.forEach((image) => {
    const [repository, tag, imageId, created, size] = image.split(/\s+/);
    const name = `${repository}:${tag}`;
    if (name === selectedConfig.tag) {
      console.log(pc.bold(pc.cyan(pc.inverse(image))));
    } else {
      console.log(image);
    }
  });
}

export async function logImageBuildStatus(input: string) {
  // console.log(pc.gray('│'));
  console.log(`${pc.green('◇')} ${input}`);
  console.log(pc.gray('│'));
}

export const pp = {
  success: (message: string) => {
    return pc.green(pc.bold(pc.inverse(i18next.t(message))));
  },
  error: (message: string) => {
    return pc.red(pc.bold(pc.inverse(i18next.t(message))));
  },
};
