import * as fs from 'fs';
import * as path from 'path';
import i18next from '@i18n';
import { globalConfig } from '@configs';
import { ServiceOptions } from '@types';
import {
  checkAndInstallScreen,
  dockerComposeDown,
  runCommand,
  buildActionMultiple,
  pp,
} from '@utils';
import { generateProductionComposeFile } from '@modules';
import retry from 'async-retry';

// 创建临时目录
function createTempDirectory(currentDirectory: string): string {
  const tempDirectory = path.join(currentDirectory, 'temp');
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory);
  }
  return tempDirectory;
}

// 创建并保存 systemd 服务文件
function createAndSaveServiceFile(options: {
  currentDirectory: string;
  tempDirectory: string;
  projectName: string;
  targetComposeFilePath: string;
}): string {
  const serviceFileContent = `[Unit]
Description=Auto launch container
After=docker.service

[Service]
Restart=always
RemainAfterExit=yes
WorkingDirectory=${options.currentDirectory}
ExecStart=/usr/bin/screen -S ${options.projectName} -dm /usr/bin/docker-compose --file ${options.targetComposeFilePath} --project-name ${options.projectName} up --build
ExecStop=/usr/bin/screen -S ${options.projectName} -X quit
Type=forking

[Install]
WantedBy=multi-user.target
`;

  const serviceFilePath = path.join(
    options.tempDirectory,
    'autolaunch_sd.service',
  );
  fs.writeFileSync(serviceFilePath, serviceFileContent);
  return serviceFilePath;
}

// 复制服务文件到 systemd 目录
async function copyServiceFileToSystemd(serviceFilePath: string) {
  await runCommand('sudo', ['cp', serviceFilePath, '/etc/systemd/system']);
}

async function waitForContainer(repositoryName: string): Promise<void> {
  await retry(
    async () => {
      const isRunning = await checkContainerStatus(repositoryName);
      if (!isRunning) {
        throw new Error(
          i18next.t('ERROR_CONTAINER_NOT_RUNNING', {
            repositoryName,
          }) as string,
        );
      } else {
        console.log(
          pp.success(i18next.t('CONTAINER_RUNNING', { repositoryName })),
        );
      }
    },
    {
      retries: 10, // 尝试次数
      minTimeout: 500, // 最小等待时间
      factor: 1, // 指数因子
    },
  );
}

async function stopAndReloadService(): Promise<void> {
  console.log(i18next.t('STOP_RELOAD_START'));
  await runCommand('sudo', ['systemctl', 'stop', 'autolaunch_sd.service']);
  await runCommand('sudo', ['systemctl', 'daemon-reload']);
  await runCommand('sudo', ['systemctl', 'start', 'autolaunch_sd.service']);
}

async function checkServiceStatus(): Promise<void> {
  await runCommand('sudo', [
    'systemctl',
    'status',
    'autolaunch_sd.service',
    '--no-pager',
  ]);
  console.log(
    pp.success(i18next.t('AUTOLUNCHER_SERVICE_VERIFIED_SUCCESSFULLY_AND_WAITING_DOCKER_CONTAINERS_TO_START')),
  );
}

async function waitForAllContainers(
  projectName: string,
  services: ServiceOptions[],
): Promise<void> {
  const waitForContainersPromises = services.map((service) => {
    const repositoryName = `${projectName}_${service.serviceName}`;
    return waitForContainer(repositoryName);
  });

  await Promise.all(waitForContainersPromises);
  console.log(pp.success(i18next.t('AUTO_LAUNCHER_INSTALLED_SUCCESSFULLY')));
}

async function startServiceAndShowStatus(options: {
  projectName: string;
  services: ServiceOptions[];
}): Promise<void> {
  const { projectName, services } = options;

  try {
    await stopAndReloadService();
    await checkServiceStatus();
    await waitForAllContainers(projectName, services);
  } catch (err) {
    console.error(i18next.t('ERROR_PRINT', { err }));
    console.error(`${i18next.t('ERROR_INSTALLING_AUTO_LAUNCHER')}: ${err}`);
    console.log(
      pp.error(
        i18next.t('REMOVE_CONFLICTING_CONTAINERS_FAILS_FRIENDLY_REMINDER'),
      ),
    );
  }
}

async function checkContainerStatus(repositoryName: string): Promise<boolean> {
  const stdout = await runCommand(
    'docker',
    ['ps', '--filter', `ancestor=${repositoryName}`, '--format', '{{.Image}}'],
    {
      captureOutput: true,
    },
  );
  return stdout?.trim() === repositoryName;
}

async function installAutoLauncher(): Promise<void> {
  // 检查并安装 screen
  await checkAndInstallScreen();

  // 获取当前工作目录的绝对路径
  const currentDirectory = path.resolve(path.dirname(''));

  // 生成 docker-compose.yaml 文件
  const { composeFilePath, services, projectName } =
    await generateProductionComposeFile();

  // 批量构建新的镜像
  await buildActionMultiple(globalConfig.buildList);

  // 创建临时目录
  const tempDirectory = createTempDirectory(currentDirectory);

  // 复制 docker-compose.yaml 文件到 /etc/stable_diffusion/ 目录
  const targetComposeFilePath = '/etc/stable_diffusion/docker-compose.yaml';
  await runCommand('sudo', ['mkdir', '-p', '/etc/stable_diffusion']);
  await runCommand('sudo', ['cp', composeFilePath, targetComposeFilePath]);

  // 创建并保存 systemd 服务文件
  const serviceFilePath = createAndSaveServiceFile({
    currentDirectory,
    tempDirectory,
    projectName,
    targetComposeFilePath,
  });

  // 输出提示信息
  console.log(
    i18next.t('SERVICE_FILE_CREATED', {
      filename: 'autolaunch_sd.service',
      directory: 'temp',
    }),
  );

  // 复制服务文件到 systemd 目录
  copyServiceFileToSystemd(serviceFilePath);

  // 停止并移除已存在的容器
  await dockerComposeDown({
    composeFilePath,
    services,
    projectName,
  });

  // 启动服务并显示状态
  startServiceAndShowStatus({ projectName, services });
}

export { installAutoLauncher };
