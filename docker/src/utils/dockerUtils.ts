import path from 'path';
import { runCommand } from './runCommand';
import { confirm } from '@clack/prompts';

async function handleExistingScreenSession(
  options: DockerComposeOptions,
): Promise<void> {
  if (await isScreenSessionRunning(options.projectName)) {
    const shouldRestart = await confirm({
      message:
        'A screen session with the same project name is already running. Do you want to restart the container?',
    });

    if (shouldRestart) {
      await dockerComposeDown(options);
      await dockerComposeUp(options);
    }
  } else {
    await dockerComposeUp(options);
  }
}

async function isScreenSessionRunning(projectName: string): Promise<boolean> {
  try {
    const result = (await runCommand('screen', ['-ls'], {
      captureOutput: true,
    })) as string;
    const regex = new RegExp(`.*${projectName}.*`);
    return regex.test(result);
  } catch (error) {
    console.error('Error checking for screen session:', error);
    return false;
  }
}

interface RemoveContainerOptions {
  containerName: string;
}

async function containerExists(containerName: string): Promise<boolean> {
  try {
    await runCommand('docker', ['inspect', containerName]);
    return true;
  } catch (error) {
    return false;
  }
}

export async function removeOldContainer(
  options: RemoveContainerOptions,
): Promise<void> {
  if (await containerExists(options.containerName)) {
    await runCommand('docker', ['rm', '-f', options.containerName]);
  }
}

interface DockerComposeOptions {
  composeFilePath: string;
  projectName: string;
  build?: boolean;
  runInBackground?: boolean;
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
    // 根据 build 的值动态添加 --build 参数
    ...(options.build ? ['--build'] : []),
  ];

  await runCommand(upCommand, upArgs);
}
