import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';
import i18next from '../i18n';

// 检查并安装 screen
async function checkAndInstallScreen(): Promise<void> {
    try {
        execSync('screen --version', { stdio: 'ignore' });
    } catch (error) {
        console.log(i18next.t("SCREEN_NOT_FOUND"));
        try {
            execSync('sudo apt-get update && sudo apt-get install -y screen', { stdio: 'inherit' });
            console.log(i18next.t("SCREEN_INSTALLED_SUCCESSFULLY"));
        } catch (installError) {
            console.error(i18next.t("SCREEN_INSTALLATION_FAILED"));
            throw installError;
        }
    }
}

// 创建临时目录
function createTempDirectory(currentDirectory: string): string {
    const tempDirectory = path.join(currentDirectory, 'temp');
    if (!fs.existsSync(tempDirectory)) {
        fs.mkdirSync(tempDirectory);
    }
    return tempDirectory;
}

// 创建并保存 systemd 服务文件
function createAndSaveServiceFile(currentDirectory: string, tempDirectory: string): string {
    const serviceFileContent = `[Unit]
Description=Auto launch container
After=docker.service

[Service]
Restart=always
RemainAfterExit=yes
WorkingDirectory=${currentDirectory}
ExecStart=/usr/bin/screen -S sd -dm /usr/bin/python3 dash.py --name autolaunch --port_increment 1
ExecStop=/usr/bin/screen -S sd -X quit

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
    execSync('sudo systemctl stop autolaunch_sd.service');
    execSync('sudo systemctl daemon-reload');
    execSync('sudo systemctl start autolaunch_sd.service');

    exec('sudo systemctl status autolaunch_sd.service', (error, stdout, stderr) => {
        if (error) {
            console.error(`${i18next.t("ERROR")}: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`${i18next.t("STD_ERR")}: ${stderr}`);
            return;
        }
        console.log(`${i18next.t("STD_OUT")}: ${stdout}`);
    });
}

async function installAutoLauncher(): Promise<void> {
    // 检查并安装 screen
    await checkAndInstallScreen();

    // 获取当前工作目录的绝对路径
    const currentDirectory = path.resolve(path.dirname(''));

    // 创建临时目录
    const tempDirectory = createTempDirectory(currentDirectory);

    // 创建并保存 systemd 服务文件
    const serviceFilePath = createAndSaveServiceFile(currentDirectory, tempDirectory);

    // 输出提示信息
    console.log(i18next.t("SERVICE_FILE_CREATED", {filename: "autolaunch_sd.service", directory: "temp"}));

    // 复制服务文件到 systemd 目录
    copyServiceFileToSystemd(serviceFilePath);

    // 启动服务并显示状态
    startServiceAndShowStatus();
}

export { installAutoLauncher };