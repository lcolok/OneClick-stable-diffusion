import path from 'path';
import { runCommand } from './runCommand';

interface DockerComposeOptions {
  composeFilePath: string;
  projectName: string;
}

export async function removeOldContainer(containerName: string): Promise<void> {
  await runCommand('docker', ['rm', '-f', containerName]);
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
  build: boolean = false,
): Promise<void> {
  const upCommand = 'docker-compose';
  const upArgs = [
    '--file',
    options.composeFilePath,
    '--project-name',
    options.projectName,
    'up',
  ];
  if (build) {
    upArgs.push('--build');
  }
  await runCommand(upCommand, upArgs);
}
