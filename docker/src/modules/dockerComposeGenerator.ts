
import { DockerComposeConfig } from 'dockerComposeTypes';
import { writeDockerComposeYamlToFile } from '@utils/yamlGenUtils';
import * as path from 'path';

const config: DockerComposeConfig = {
  version: '3.8',
  services: {
    sd: {
      build: {
        context: '.',
        dockerfile: './dockerfile/Dockerfile.launch_ext',
        args: {
          sdwebui: 'true',
        },
      },
      runtime: 'nvidia',
      environment: [
        'NVIDIA_VISIBLE_DEVICES=all',
        'JUPYTER_PORT=33333',
        'SDWEBUI_PORT=7860',
      ],
      ports: ['33333:33333', '7860:7860'],
      volumes: [
        // 您的 volumes 列表
      ],
      stdin_open: true,
      tty: true,
    },
  },
};


export function dockerComposeGen() {
  const ymlOutputDist = path.join('temp', 'docker-compose.standard.temp.yaml');
  writeDockerComposeYamlToFile(config, ymlOutputDist);
}