import random
import yaml

def generate_service(service_name, port, service_template):
    new_service = service_template.copy()
    new_service['container_name'] = f'{service_name}_container'
    new_service['environment'][-1] = 'SDWEBUI_PORT=7860'
    new_service['ports'] = [f'{port}:7860']
    new_volumes = []
    for volume in new_service['volumes']:
        if 'outputs' in volume:
            volume = f'/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master/outputs/{port}:/home/stable-diffusion-webui/outputs'
        new_volumes.append(volume)
    new_service['volumes'] = new_volumes
    return {service_name: new_service}

with open('docker-compose.test.temp.yaml', 'r') as f:
    temp_yaml = yaml.safe_load(f)

services = {}
original_service_name = list(temp_yaml['services'].keys())[0]
original_service_template = temp_yaml['services'][original_service_name]

for i in range(10):
    port = random.randint(15000, 65535)
    services.update(generate_service(f'sd_service_test_{i+1}', port, original_service_template))

temp_yaml['services'] = services

with open('docker-compose.generated.yml', 'w') as f:
    yaml.dump(temp_yaml, f, default_flow_style=False)
