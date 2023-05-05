import path from 'path';
import { confirm } from '@clack/prompts';
import i18next from '@i18n';
import { checkAndInstallScreen, runCommand } from '@utils';
import { DockerComposeOptions } from '@types';

export async function handleExistingScreenSession(
  options: DockerComposeOptions,
): Promise<void> {
  if (await isScreenSessionRunning(options.projectName)) {
    const shouldRestart =
      options.forceRestart ||
      (await confirm({
        message: i18next.t('SCREEN_SESSION_ALREADY_RUNNING'),
        active: i18next.t('RESTART') as string,
        inactive: i18next.t('DO_NOT_RESTART') as string,
        initialValue: false,
      }));

    if (shouldRestart) {
      console.log(i18next.t('STOPPING_AND_REMOVING_DOCKER_CONTAINERS'));
      await dockerComposeDown(options);
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

  if (options.forceRebuild) {
    buildOption = '--build';
  } else {
    const imageExists = await checkDockerImageExists(options);
    if (!imageExists) {
      buildOption = '--build';
    }
  }

  const upCommand = 'screen';
  const upArgs = [
    // 添加 -S 参数，指定项目名称
    '-S',
    options.projectName,
    // 根据 runInBackground 的值动态添加 -dm 参数，表示在后台运行容器
    ...(options.runInBackground ? ['-dm'] : []),
    // 指定要运行的命令为 bash
    'bash',
    '-c',
    // 在 bash 中执行以下命令
    [
      // 使用 docker-compose 启动服务
      'docker-compose',
      // 指定 docker-compose 文件路径
      '--file',
      options.composeFilePath,
      // 指定项目名称
      '--project-name',
      options.projectName,
      // 启动服务命令
      'up',
      // 如果 buildOption 不为空，则添加到数组中，用于构建镜像
      ...(buildOption ? [buildOption] : []),
      // 用分号分隔多个命令，此处是为了防止容器自动退出
      ';',
      // 打印错误信息并等待用户按下回车键
      'echo',
      '"Error occurred, press Enter to close the screen session..."',
      ';',
      'read',
    ].join(' '),
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
