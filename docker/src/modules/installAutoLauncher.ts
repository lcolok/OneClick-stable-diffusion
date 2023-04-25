import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';

async function installAutoLauncher(): Promise<void> {
  // 获取当前工作目录的绝对路径
  const currentDirectory = path.resolve(path.dirname(''));
  const tempDirectory = path.join(currentDirectory, 'temp');

  // 检查 temp 目录是否存在，如果不存在，则创建一个
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory);
  }

  // 创建 autolaunch_sd.service 文件内容
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

  // 将内容写入 service 文件
  const serviceFilePath = path.join(tempDirectory, 'autolaunch_sd.service');
  fs.writeFileSync(serviceFilePath, serviceFileContent);

  // 复制 service 文件到 /etc/systemd/system 目录（需要 root 权限）
  execSync(`sudo cp ${serviceFilePath} /etc/systemd/system`);

  // 输出提示信息
  console.log("Service file 'autolaunch_sd.service' has been created in the 'temp' directory and copied to /etc/systemd/system.");

  // Reload systemd daemon and start the service
  execSync('sudo systemctl stop autolaunch_sd.service');
  execSync('sudo systemctl daemon-reload');
  execSync('sudo systemctl start autolaunch_sd.service');

  // Check the status of the service
  exec('sudo systemctl status autolaunch_sd.service', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Stdout: ${stdout}`);
  });
}

export { installAutoLauncher };