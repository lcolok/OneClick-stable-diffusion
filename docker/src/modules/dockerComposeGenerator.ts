import { DockerComposeConfig } from 'dockerComposeTypes';
import { writeDockerComposeYamlToFile } from '@utils/yamlGenUtils';
import * as path from 'path';
import { path as projectRootDir } from 'app-root-path';

const repoRootDir = path.join(projectRootDir, '..');
const dockerfileDir = path.join(projectRootDir, 'dockerfile');

const portMappings = {
  JUPYTER_PORT: 33333,
  SDWEBUI_PORT: 7860,
};

function generateEnvironmentAndPorts(portMappings: Record<string, number>) {
  const environment = Object.entries(portMappings).map(
    ([key, value]) => `${key}=${value}`,
  );
  const ports = Object.values(portMappings).map((port) => `${port}:${port}`);
  return { environment, ports };
}

function generateVolumes() {
  const host_sd_dir =
    '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master';
  const container_sd_dir = '/home/stable-diffusion-webui';
  const volumeMappings = [
    {
      source: '/mnt/flies/AI_research/Stable_Diffusion/.cache',
      target: '/root/.cache',
    },
    { source: `${host_sd_dir}/models`, target: `${container_sd_dir}/models` },
    {
      source: `${host_sd_dir}/embeddings`,
      target: `${container_sd_dir}/embeddings`,
    },
    {
      source: `${host_sd_dir}/interrogate`,
      target: `${container_sd_dir}/interrogate`,
    },
    {
      source: `${host_sd_dir}/models/SadTalker/checkpoints`,
      target: `${container_sd_dir}/extensions/SadTalker/checkpoints/`,
    },
    {
      source: `${host_sd_dir}/models/SadTalker/gfpgan`,
      target: `${container_sd_dir}/extensions/SadTalker/gfpgan/`,
    },
    { source: `${host_sd_dir}/outputs`, target: `${container_sd_dir}/outputs` },
    {
      source: `${host_sd_dir}/extensions/sd-webui-controlnet/models`,
      target: `${container_sd_dir}/extensions/sd-webui-controlnet/models`,
    },
    {
      source: `${host_sd_dir}/extensions/sd-webui-controlnet/annotator`,
      target: `${container_sd_dir}/extensions/sd-webui-controlnet/annotator`,
    },
    {
      source: `${host_sd_dir}/cache.json`,
      target: `${container_sd_dir}/cache.json`,
    },
    {
      source: `${host_sd_dir}/config.json`,
      target: `${container_sd_dir}/config.json`,
    },
  ];
  const wildcardVolume = {
    source: `${repoRootDir}/configs/wildcards_lib`,
    target: `${container_sd_dir}/extensions/stable-diffusion-webui-wildcards/wildcards`,
  };

  return volumeMappings
    .map(({ source, target }) => `${source}:${target}`)
    .concat(`${wildcardVolume.source}:${wildcardVolume.target}`);
}

const { environment, ports } = generateEnvironmentAndPorts(portMappings);

const config: DockerComposeConfig = {
  version: '3.8',
  services: {
    sd: {
      build: {
        context: projectRootDir,
        dockerfile: `${dockerfileDir}/Dockerfile.launch_ext`,
        args: {
          sdwebui: 'true',
        },
      },
      runtime: 'nvidia',
      environment: ['NVIDIA_VISIBLE_DEVICES=all', ...environment],
      ports,
      volumes: generateVolumes(),
      stdin_open: true,
      tty: true,
    },
  },
};

export function dockerComposeGen() {
  const ymlOutputDist = path.join('temp', 'docker-compose.standard.temp.yaml');
  writeDockerComposeYamlToFile(config, ymlOutputDist);
}
