import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';

// 检查并安装 screen
async function checkAndInstallScreen(): Promise<void> {
    try {
        execSync('screen --version', { stdio: 'ignore' });
    } catch (error) {
        console.log('未检测到 screen，现在将自动安装...');
        try {
            execSync('sudo apt-get update && sudo apt-get install -y screen', { stdio: 'inherit' });
            console.log('已成功安装 screen。');
        } catch (installError) {
            console.error('安装 screen 时出错，请手动安装。');
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
            console.error(`错误: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`标准错误: ${stderr}`);
            return;
        }
        console.log(`标准输出: ${stdout}`);
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
    console.log("服务文件 'autolaunch_sd.service' 已在 'temp' 目录创建并复制到 /etc/systemd/system.");

    // 复制服务文件到 systemd 目录
    copyServiceFileToSystemd(serviceFilePath);

    // 启动服务并显示状态
    startServiceAndShowStatus();
}

export { installAutoLauncher };