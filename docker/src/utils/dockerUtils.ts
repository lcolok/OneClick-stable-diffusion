import path from 'path';
import { runCommand } from './runCommand';

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
  const upCommand = 'docker-compose';
  const upArgs = [
    '--file',
    options.composeFilePath,
    '--project-name',
    options.projectName,
    'up',
  ];
  if (options.build) {
    upArgs.push('--build');
  }
  await runCommand(upCommand, upArgs);
}
