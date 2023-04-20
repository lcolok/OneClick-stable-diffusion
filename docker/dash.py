# 全称：Docker Adaptive Service Handler.py 即根据指定的容器名称或随机名称灵活地处理 Docker 服务

import sys
import random
import string
import yaml
import os

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def update_container_names(yaml_content, custom_name=None):
    for service_name in yaml_content['services']:
        if custom_name:
            container_name = f'{service_name}_{custom_name}'
        else:
            random_string = generate_random_string(8)
            container_name = f'{service_name}_{random_string}'

        yaml_content['services'][service_name]['container_name'] = container_name

    return yaml_content

def run_docker_compose_with_temporary_yaml(yaml_content, file_suffix):
    script_directory = os.path.dirname(os.path.realpath(__file__))
    temp_yaml_path = os.path.join(script_directory, f"{file_suffix}")
    with open(temp_yaml_path, 'w') as temp_yaml:
        yaml.safe_dump(yaml_content, temp_yaml, default_flow_style=False)
        temp_yaml.flush()
        os.system(f"docker-compose -f {temp_yaml.name} up --build")

    os.remove(temp_yaml_path)

def find_yaml_file():
    if os.path.isfile('docker-compose.yml'):
        return 'docker-compose.yml'
    elif os.path.isfile('docker-compose.yaml'):
        return 'docker-compose.yaml'
    else:
        raise FileNotFoundError("Could not find docker-compose.yml or docker-compose.yaml in the current directory.")

if __name__ == "__main__":
    custom_name = sys.argv[1] if len(sys.argv) > 1 else None
    yaml_file = find_yaml_file()
    with open(yaml_file, 'r') as file:
        content = yaml.safe_load(file)

    updated_content = update_container_names(content, custom_name)

    if custom_name:
        file_suffix = f"{custom_name}.temp.yml"
    else:
        random_string = generate_random_string(8)
        file_suffix = f"{random_string}.temp.yml"

    run_docker_compose_with_temporary_yaml(updated_content, file_suffix)
