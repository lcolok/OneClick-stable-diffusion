import path from 'path';
import { confirm } from '@clack/prompts';
import i18next from '@i18n';
import { checkAndInstallScreen, runCommand } from '@utils';
import { DockerComposeOptions } from '@types';

export async function handleExistingScreenSession(
  options: DockerComposeOptions
): Promise<void> {
  if (await isScreenSessionRunning(options.projectName)) {
    const shouldRestart = options.forceRestart || await confirm({
      message: i18next.t('SCREEN_SESSION_ALREADY_RUNNING'),
      active: i18next.t('RESTART') as string,
      inactive: i18next.t('DO_NOT_RESTART') as string,
      initialValue: false,
    });

    if (shouldRestart) {
      console.log(i18next.t('STOPPING_AND_REMOVING_DOCKER_CONTAINERS'));
      await dockerComposeDown(options);
      await removeOldContainer({ containerName: options.containerName });
      console.log(i18next.t('DOCKER_CONTAINERS_STOPPED_AND_REMOVED'));
    }
  }
  await dockerComposeUp(options);
}

async function isScreenSessionRunning(projectName: string): Promise<boolean> {
  // 检查并安装 screen
  await checkAndInstallScreen();
  try {
    const stdout = await runCommand('screen', ['-ls'], { captureOutput: true });
    const regex = new RegExp(`.*${projectName}.*`);
    return regex.test(stdout as string);
  } catch (error) {
    console.error('Error checking for screen session:', error);
    return false;
  }
}

async function containerExists(containerName: string): Promise<boolean> {
  try {
    await runCommand('docker', ['inspect', containerName]);
    return true;
  } catch (error) {
    return false;
  }
}

export async function removeOldContainer(options: {
  containerName: string;
}): Promise<void> {
  if (await containerExists(options.containerName)) {
    await runCommand('docker', ['rm', '-f', options.containerName]);
  }
}

export async function dockerComposeDown(
  options: DockerComposeOptions,
): Promise<void> {
  const downCommand = 'docker-compose';
  const downArgs = [
    '--file',
    options.composeFilePath,
    '--project-name',
    options.projectName,
    'down',
  ];
  await runCommand(downCommand, downArgs);
}

export async function dockerComposeUp(
  options: DockerComposeOptions,
): Promise<void> {
  // 检查并安装 screen
  await checkAndInstallScreen();

  let buildOption = '';

  if (options.build === 'force') {
    buildOption = '--build';
  } else if (options.build === 'none') {
    buildOption = '';
  } else {
    const imageExists = await checkDockerImageExists(options);
    if (!imageExists) {
      buildOption = '--build';
    }
  }

  const upCommand = 'screen';
  const upArgs = [
    '-S',
    options.projectName,
    // 根据 runInBackground 的值动态添加 -dm 参数
    ...(options.runInBackground ? ['-dm'] : []),
    'docker-compose',
    '--file',
    options.composeFilePath,
    '--project-name',
    options.projectName,
    'up',
    // 如果 buildOption 不为空，则添加到数组中
    ...(buildOption ? [buildOption] : []),
  ];
  // console.log(upCommand + ' ' + upArgs.join(' '));
  await runCommand(upCommand, upArgs);
}

async function checkDockerImageExists(
  options: DockerComposeOptions,
): Promise<boolean> {
  const imageName = `${options.projectName}_${options.serviceName}`;

  const stdout = await runCommand(
    'docker',
    ['image', 'ls', '--format', '{{.Repository}}'],
    {
      captureOutput: true,
    },
  );

  return (stdout as string).includes(imageName);
}
