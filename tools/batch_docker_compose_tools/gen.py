import os

def find_temp_folder():
    folder_path = None
    yaml_files = []
    for root, dirs, files in os.walk('.'):
        if 'temp' in dirs:
            folder_path = os.path.join(root, 'temp')
            break
    if folder_path is not None:
        for file in os.listdir(folder_path):
            if file.endswith('.yaml') or file.endswith('.yml'):
                yaml_path = os.path.join(folder_path, file)
                yaml_abs_path = os.path.abspath(yaml_path)
                yaml_files.append(yaml_abs_path)
    return yaml_files

import requests

def get_public_ip() -> str:
    # 使用 ipify 服务获取公网 IP 地址
    response = requests.get('https://api.ipify.org?format=json')
    if response.status_code == 200:
        data = response.json()
        return data['ip']
    else:
        return ''  # 请求失败，返回空字符串

def print_linked_ports(output_file: str) -> None:
    public_ip = get_public_ip()

    with open(output_file, 'r') as f:
        docker_compose = yaml.safe_load(f)

    services = docker_compose.get('services', {})
    for service_name, service_config in services.items():
        ports = service_config.get('ports', [])
        if ports:
            print(f"Service: {service_name}")
            for port_mapping in ports:
                local_port = port_mapping.split(':')[0]
                link = f"http://{public_ip}:{local_port}"
                print(f"Link: {link}")
        else:
            print(f"Service: {service_name} - No ports defined")
        print()  # 打印空行以分隔服务之间的输出


import random
import yaml


def generate_service(service_name, port, service_template,workdir):
    new_service = service_template.copy()
    new_service['container_name'] = f'{service_name}_container'
    new_service['environment'][-1] = f'SDWEBUI_PORT=7860'
    new_service['ports'] = [f'{port}:7860']
    new_volumes = []
    for volume in new_service['volumes']:
        if 'outputs' in volume:
            volume = f'{workdir}/outputs/{port}:/home/stable-diffusion-webui/outputs'
        new_volumes.append(volume)
    new_service['volumes'] = new_volumes
    return {service_name: new_service}

def print_highlighted_command(output_file: str) -> None:
    command = f"docker-compose -f {output_file} up"
    print("\033[33m复制以下命令执行\033[0m")
    command_ansi = "\033[7m\033[1m" + command + "\033[0m"
    print("\n" + command_ansi + "\n")


def generate_docker_compose_template(template_file, output_file, num_services, port_range):
    with open(template_file, 'r') as f:
        temp_yaml = yaml.safe_load(f)

    if 'services' not in temp_yaml or not temp_yaml['services']:
        # raise ValueError("模板文件中没有找到有效的服务定义。")
        return
    
    services = {}
    original_service_name = list(temp_yaml['services'].keys())[0]
    original_service_template = temp_yaml['services'][original_service_name]

    for i in range(num_services):
        port = random.randint(*port_range)
        service_name = f'sd_service_test_{i+1}'
        services.update(generate_service(service_name, port, original_service_template,'/assets'))

    temp_yaml['services'] = services

    with open(output_file, 'w') as f:
        yaml.dump(temp_yaml, f, default_flow_style=False)

    # 打印高亮的命令行
    print_highlighted_command(output_file)
    # 打印全部端口
    print_linked_ports(output_file)

from pathlib import Path


temp_folder_paths = find_temp_folder()
if temp_folder_paths:
    for yaml_path in temp_folder_paths:
        # print("Absolute path of YAML file:", yaml_path)
        yaml_path = Path(yaml_path)
        dir_path = yaml_path.parent
        file_name = yaml_path.stem
        file_ext = yaml_path.suffix

        if ".batchLaunch" in file_name:
            print(f"跳过处理文件: {yaml_path}")
            continue
        
        batch_launch_file = dir_path / f"{file_name}.batchLaunch{file_ext}"
        generate_docker_compose_template(str(yaml_path), batch_launch_file, 10, (15000, 65535))

else:
    print("找不到名为 'temp' 的文件夹或没有找到 YAML 文件。")

