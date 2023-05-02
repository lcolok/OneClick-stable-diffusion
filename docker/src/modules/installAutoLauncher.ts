import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync, spawn, SpawnOptions } from 'child_process';
import i18next from '@i18n';
import {
  checkAndInstallScreen,
  generateProductionComposeFile,
  removeOldContainer,
  dockerComposeDown,
} from '@utils';
import pc from 'picocolors';

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
ExecStart=/usr/bin/screen -S ${options.projectName} -dm /usr/bin/docker-compose --file ${options.targetComposeFilePath} --project-name ${options.projectName} up
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
function copyServiceFileToSystemd(serviceFilePath: string) {
  execSync(`sudo cp ${serviceFilePath} /etc/systemd/system`);
}

// 启动服务并显示状态
async function startServiceAndShowStatus(options: { containerName: string }) {
  const { containerName } = options;

  const spawnOptions: SpawnOptions = {
    stdio: ['pipe', 'inherit', 'inherit'],
  };

  // 输出停止、重新加载和启动服务的提示信息
  console.log(i18next.t('STOP_RELOAD_START'));

  // 停止并重新启动服务
  execSync('sudo systemctl stop autolaunch_sd.service');
  execSync('sudo systemctl daemon-reload');
  execSync('sudo systemctl start autolaunch_sd.service');

  // 检查服务状态
  const systemctl = spawn(
    'sudo',
    ['systemctl', 'status', 'autolaunch_sd.service', '--no-pager'],
    spawnOptions,
  );

  systemctl.on('close', async (code: number) => {
    // console.log(i18next.t('CLOSED_WITH_CODE', { code }));

    const checkInterval = 500; // 每500毫秒检查一次
    const timeout = 5000; // 5秒超时时间
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const checkStatusAndClear = async () => {
      try {
        const containerStatus = await checkContainerStatus(containerName);
        if (containerStatus) {
          console.log(
            pc.green(
              pc.bold(
                pc.inverse(i18next.t('AUTO_LAUNCHER_INSTALLED_SUCCESSFULLY')),
              ),
            ),
          );
          clearInterval(intervalId);
          clearTimeout(timeoutId); // 取消超时逻辑
        }
      } catch (err) {
        console.error(
          pc.red(
            pc.bold(
              i18next.t('ERROR_CHECKING_CONTAINER_STATUS', {
                containerName,
                err,
              }),
            ),
          ),
        );
      }
    };

    // 每500毫秒检查一次容器状态
    intervalId = setInterval(checkStatusAndClear, checkInterval);

    // 超过5秒后，停止检查容器状态并显示错误消息
    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      console.error(
        i18next.t('ERROR_CONTAINER_NOT_RUNNING', { containerName }),
      );
    }, timeout);
  });

  systemctl.on('error', (err: Error) => {
    console.error(i18next.t('ERROR_PRINT', { err }));
    console.error(`${i18next.t('ERROR_INSTALLING_AUTO_LAUNCHER')}: ${err}`);
  });
}

function checkContainerStatus(containerName: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec(
      `docker ps --filter "name=${containerName}" --format "{{.Names}}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else if (stderr) {
          reject(new Error(stderr));
        } else {
          resolve(stdout.trim() === containerName);
        }
      },
    );
  });
}

async function installAutoLauncher(): Promise<void> {
  // 检查并安装 screen
  await checkAndInstallScreen();

  // 获取当前工作目录的绝对路径
  const currentDirectory = path.resolve(path.dirname(''));

  // 生成 docker-compose.yaml 文件
  const { composeFilePath, containerName, projectName } =
    await generateProductionComposeFile();

  // 创建临时目录
  const tempDirectory = createTempDirectory(currentDirectory);

  // 复制 docker-compose.yaml 文件到 /etc/stable_diffusion/ 目录
  const targetComposeFilePath = '/etc/stable_diffusion/docker-compose.yaml';
  execSync(`sudo mkdir -p /etc/stable_diffusion`);
  execSync(`sudo cp ${composeFilePath} ${targetComposeFilePath}`);

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
  await dockerComposeDown({ composeFilePath, containerName, projectName });
  await removeOldContainer({ containerName });

  // 启动服务并显示状态
  startServiceAndShowStatus({ containerName });
}

export { installAutoLauncher };
