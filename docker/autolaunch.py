import os
import subprocess

# 获取当前工作目录的绝对路径
current_directory = os.path.abspath(os.path.dirname(__file__))
temp_directory = os.path.join(current_directory, "temp")

# 检查 temp 目录是否存在，如果不存在，则创建一个
if not os.path.exists(temp_directory):
    os.makedirs(temp_directory)

# 创建 autolaunch_sd.service 文件内容
service_file_content = f"""[Unit]
Description=Auto launch container
After=docker.service

[Service]
Restart=always
WorkingDirectory={current_directory}
ExecStart=/usr/bin/python3 dash.py --name autolaunch --port_increment 1

[Install]
WantedBy=multi-user.target
"""

# 将内容写入 service 文件
service_file_path = os.path.join(temp_directory, "autolaunch_sd.service")
with open(service_file_path, "w") as service_file:
    service_file.write(service_file_content)

# 复制 service 文件到 /etc/systemd/system 目录（需要 root 权限）
subprocess.run(["sudo", "cp", service_file_path, "/etc/systemd/system"])

# 输出提示信息
print("Service file 'autolaunch_sd.service' has been created in the 'temp' directory and copied to /etc/systemd/system.")

# Reload systemd daemon and start the service
subprocess.run(["sudo", "systemctl", "daemon-reload"])
subprocess.run(["sudo", "systemctl", "start", "autolaunch_sd.service"])

# Check the status of the service
status_result = subprocess.run(["sudo", "systemctl", "status", "autolaunch_sd.service"], capture_output=True, text=True)
print(status_result.stdout)
