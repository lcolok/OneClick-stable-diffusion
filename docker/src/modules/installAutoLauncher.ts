import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync, spawn, SpawnOptions } from 'child_process';
import i18next from '@i18n';
import { checkAndInstallScreen, generateProductionComposeFile } from '@utils';

// 创建临时目录
function createTempDirectory(currentDirectory: string): string {
  const tempDirectory = path.join(currentDirectory, 'temp');
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory);
  }
  return tempDirectory;
}

// 创建并保存 systemd 服务文件
function createAndSaveServiceFile(
  currentDirectory: string,
  tempDirectory: string,
): string {
  const serviceFileContent = `[Unit]
Description=Auto launch container
After=docker.service

[Service]
Restart=always
RemainAfterExit=yes
WorkingDirectory=${currentDirectory}
ExecStart=/usr/bin/docker-compose -f /etc/stable_diffusion/docker-compose.yaml up -d
ExecStop=/usr/bin/docker-compose -f /etc/stable_diffusion/docker-compose.yaml down

[Install]
WantedBy=multi-user.target
`;

  const serviceFilePath = path.join(tempDirectory, 'autolaunch_sd.service');
  fs.writeFileSync(serviceFilePath, serviceFileContent);
  return serviceFilePath;
}

// 复制服务文件到 systemd 目录
function copyServiceFileToSystemd(serviceFilePath: string) {
  execSync(`sudo cp ${serviceFilePath} /etc/systemd/system`);
}

// 启动服务并显示状态
function startServiceAndShowStatus() {
  const spawnOptions: SpawnOptions = {
    stdio: ['pipe', 'inherit', 'inherit'],
  };

  // 输出停止、重新加载和启动服务的提示信息
  console.log(i18next.t('STOP_RELOAD_START'));

  // 停止并重新启动服务
  execSync('sudo systemctl stop autolaunch_sd.service');
  execSync('sudo systemctl daemon-reload');
  execSync('sudo systemctl start autolaunch_sd.service');

  // 启动子进程并将标准输出和标准错误输出传递到父进程的输出中
  const systemctl = spawn(
    'sudo',
    ['systemctl', 'status', 'autolaunch_sd.service'],
    spawnOptions,
  );

  systemctl.on('close', (code: number) => {
    console.log(i18next.t('CLOSED_WITH_CODE', { code }));
    console.log(i18next.t('AUTO_LAUNCHER_INSTALLED_SUCCESSFULLY'));
  });

  systemctl.on('error', (err: Error) => {
    console.error(i18next.t('ERROR_PRINT', { err }));
    console.error(`${i18next.t('ERROR_INSTALLING_AUTO_LAUNCHER')}: ${err}`);
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
  const serviceFilePath = createAndSaveServiceFile(
    currentDirectory,
    tempDirectory,
  );

  // 输出提示信息
  console.log(
    i18next.t('SERVICE_FILE_CREATED', {
      filename: 'autolaunch_sd.service',
      directory: 'temp',
    }),
  );

  // 复制服务文件到 systemd 目录
  copyServiceFileToSystemd(serviceFilePath);

  // 启动服务并显示状态
  startServiceAndShowStatus();
}

export { installAutoLauncher };
