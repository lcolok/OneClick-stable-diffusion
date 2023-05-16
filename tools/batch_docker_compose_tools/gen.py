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



import random
import yaml

def generate_service(service_name, port, service_template,workdir):
    new_service = service_template.copy()
    new_service['container_name'] = f'{service_name}_container'
    new_service['environment'][-1] = f'SDWEBUI_PORT={port}'
    new_service['ports'] = [f'{port}:7860']
    new_volumes = []
    for volume in new_service['volumes']:
        if 'outputs' in volume:
            volume = f'{workdir}/outputs/{port}:/home/stable-diffusion-webui/outputs'
        new_volumes.append(volume)
    new_service['volumes'] = new_volumes
    return {service_name: new_service}

def generate_docker_compose_template(template_file, output_file, num_services, port_range):
    with open(template_file, 'r') as f:
        temp_yaml = yaml.safe_load(f)

    if 'services' not in temp_yaml or not temp_yaml['services']:
        raise ValueError("模板文件中没有找到有效的服务定义。")

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

from pathlib import Path

temp_folder_paths = find_temp_folder()
if temp_folder_paths:
    for yaml_path in temp_folder_paths:
        print("Absolute path of YAML file:", yaml_path)
        yaml_path = Path(yaml_path)
        dir_path = yaml_path.parent
        file_name = yaml_path.stem
        file_ext = yaml_path.suffix
        
        if ".batchLaunch" in file_name:
            print(f"跳过处理文件: {yaml_path}")
            continue
        
        batch_launch_file = dir_path / f"{file_name}.batchLaunch{file_ext}"
        generate_docker_compose_template(str(yaml_path), batch_launch_file, 8, (15000, 65535))

        # 进一步处理 batch_launch_file，例如使用它进行文件操作
else:
    print("找不到名为 'temp' 的文件夹或没有找到 YAML 文件。")