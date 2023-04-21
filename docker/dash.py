#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 全称：Docker Adaptive Service Handler.py 即根据指定的容器名称或随机名称灵活地处理 Docker 服务
# 该脚本用于根据给定的自定义名称或随机名称，以及给定的端口增量值来更新 docker-compose.yaml 文件。
# 这将允许您在不更改原始 docker-compose 文件的情况下运行具有自定义名称和端口的容器。
# 脚本将生成一个临时的 docker-compose.yaml 文件，并使用它来启动 Docker Compose。

import sys
import random
import string
import yaml
import os
import re
import argparse

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def update_container_names(yaml_content, custom_name=None, n=1):
    for service_name in yaml_content['services']:
        if custom_name:
            container_name = f'{service_name}_{custom_name}'
        else:
            random_string = generate_random_string(8)
            container_name = f'{service_name}_{random_string}'

        # 更新环境变量中的端口
        if 'environment' in yaml_content['services'][service_name]:
            for i, env_var in enumerate(yaml_content['services'][service_name]['environment']):
                key, value = env_var.split('=')
                if "PORT" in key:
                    yaml_content['services'][service_name]['environment'][i] = f"{key}={int(value) + n}"

        # 获取环境变量
        env_variables = {}
        for env_var in yaml_content['services'][service_name]['environment']:
            key, value = env_var.split('=')
            env_variables[key] = value

        # 更新所有端口加 n
        if 'ports' in yaml_content['services'][service_name]:
            for i, port in enumerate(yaml_content['services'][service_name]['ports']):
                port_parts = port.split(':')

                if re.match(r'\$\{.*\}', port_parts[0]):
                    host_port = int(env_variables[port_parts[0].strip('${}')])  # Remove the addition of n
                else:
                    host_port = int(port_parts[0]) + n

                if re.match(r'\$\{.*\}', port_parts[1]):
                    container_port = int(env_variables[port_parts[1].strip('${}')])  # Remove the addition of n
                else:
                    container_port = int(port_parts[1]) + n

                yaml_content['services'][service_name]['ports'][i] = f"{host_port}:{container_port}"

        yaml_content['services'][service_name]['container_name'] = container_name

        # 如果有 context 字段，则将其路径改为脚本所在目录下的 temp 文件夹
        if 'build' in yaml_content['services'][service_name]:
            if 'context' in yaml_content['services'][service_name]['build']:
                context = yaml_content['services'][service_name]['build']['context']
                context_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), context)
                yaml_content['services'][service_name]['build']['context'] = context_path

    return yaml_content

def run_docker_compose_with_temporary_yaml(yaml_content, file_suffix):
    # 临时文件的路径为当前脚本目录下的 temp 文件夹
    script_directory = os.path.join(os.getcwd(), os.path.dirname(__file__), "temp")
    if not os.path.exists(script_directory):
        os.makedirs(script_directory)
    temp_yaml_path = os.path.join(script_directory, f"{file_suffix}")

    with open(temp_yaml_path, "w") as temp_yaml:
        yaml.safe_dump(yaml_content, temp_yaml, default_flow_style=False)
        temp_yaml.flush()

        # 通过 -f 指定临时 yaml 文件的路径
        # os.system(f"docker-compose -f {temp_yaml.name} up --build")
        os.system(f"docker-compose -f {temp_yaml.name} up")

    # os.remove(temp_yaml_path)


def find_yaml_file():
    if os.path.isfile("docker-compose.yml"):
        return "docker-compose.yml"
    elif os.path.isfile("docker-compose.yaml"):
        return "docker-compose.yaml"
    else:
        raise FileNotFoundError(
            "Could not find docker-compose.yml or docker-compose.yaml in the current directory."
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Launch Docker Compose with custom container names and incremented ports.")
    parser.add_argument('--name', type=str, help="Custom name for containers", default=None)
    parser.add_argument('--port_increment', type=int, help="Increment value for ports", default=1)

    args = parser.parse_args()
    custom_name = args.name
    n = args.port_increment
    
    yaml_file = find_yaml_file()
    with open(yaml_file, 'r') as file:
        content = yaml.safe_load(file)

    updated_content = update_container_names(content, custom_name, n)

    if custom_name:
        file_suffix = f"{custom_name}.temp.yml"
    else:
        random_string = generate_random_string(8)
        file_suffix = f"{random_string}.temp.yml"

    run_docker_compose_with_temporary_yaml(updated_content, file_suffix)