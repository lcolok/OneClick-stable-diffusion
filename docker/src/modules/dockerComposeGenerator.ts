import { DockerComposeConfig } from 'dockerComposeTypes';
import { writeDockerComposeYamlToFile } from '@utils/yamlGenUtils';
import * as path from 'path';
import { path as projectRootDir } from 'app-root-path';

interface DockerComposeGenOptions {
  ymlOutputDist: string;
  serviceName: string;
  containerName?: string;
  networkName: string;
  host_sdwebui_dir: string;
  container_sdwebui_dir: string;
  portMappings: Record<string, number>;
}

export function dockerComposeGen({
  ymlOutputDist,
  serviceName,
  containerName,
  networkName,
  host_sdwebui_dir,
  container_sdwebui_dir,
  portMappings,
}: DockerComposeGenOptions): void {
  const repoRootDir = path.join(projectRootDir, '..');
  const dockerfileDir = path.join(projectRootDir, 'dockerfile');

  function generateEnvironmentAndPorts(portMappings: Record<string, number>) {
    const environment = Object.entries(portMappings).map(
      ([key, value]) => `${key}=${value}`,
    );
    const ports = Object.values(portMappings).map((port) => `${port}:${port}`);
    return { environment, ports };
  }

  function generateVolumes({
    host_sdwebui_dir,
    container_sdwebui_dir,
  }: Record<string, string>) {
    const volumeMappings = [
      {
        source: '/mnt/flies/AI_research/Stable_Diffusion/.cache',
        target: '/root/.cache',
      },
      {
        source: `${host_sdwebui_dir}/models`,
        target: `${container_sdwebui_dir}/models`,
      },
      {
        source: `${host_sdwebui_dir}/embeddings`,
        target: `${container_sdwebui_dir}/embeddings`,
      },
      {
        source: `${host_sdwebui_dir}/interrogate`,
        target: `${container_sdwebui_dir}/interrogate`,
      },
      {
        source: `${host_sdwebui_dir}/models/SadTalker/checkpoints`,
        target: `${container_sdwebui_dir}/extensions/SadTalker/checkpoints/`,
      },
      {
        source: `${host_sdwebui_dir}/models/SadTalker/gfpgan`,
        target: `${container_sdwebui_dir}/extensions/SadTalker/gfpgan/`,
      },
      {
        source: `${host_sdwebui_dir}/outputs`,
        target: `${container_sdwebui_dir}/outputs`,
      },
      {
        source: `${host_sdwebui_dir}/extensions/sd-webui-controlnet/models`,
        target: `${container_sdwebui_dir}/extensions/sd-webui-controlnet/models`,
      },
      {
        source: `${host_sdwebui_dir}/extensions/sd-webui-controlnet/annotator`,
        target: `${container_sdwebui_dir}/extensions/sd-webui-controlnet/annotator`,
      },
      {
        source: `${host_sdwebui_dir}/cache.json`,
        target: `${container_sdwebui_dir}/cache.json`,
      },
      {
        source: `${host_sdwebui_dir}/config.json`,
        target: `${container_sdwebui_dir}/config.json`,
      },
    ];
    const wildcardVolume = {
      source: `${repoRootDir}/configs/wildcards_lib`,
      target: `${container_sdwebui_dir}/extensions/stable-diffusion-webui-wildcards/wildcards`,
    };
    volumeMappings.push(wildcardVolume);

    return volumeMappings.map(({ source, target }) => `${source}:${target}`);
  }

  const { environment, ports } = generateEnvironmentAndPorts(portMappings);

  const config: DockerComposeConfig = {
    version: '3.8',
    services: {
      [serviceName]: {
        // 仅在提供 containerName 时添加 container_name 属性
        ...(containerName ? { container_name: containerName } : {}),
        build: {
          context: projectRootDir,
          dockerfile: `${dockerfileDir}/Dockerfile.launch_ext`,
          // args: {
          //   sdwebui: 'true',
          // },
        },
        runtime: 'nvidia',
        environment: ['NVIDIA_VISIBLE_DEVICES=all', ...environment],
        ports: ports,
        volumes: generateVolumes({ host_sdwebui_dir, container_sdwebui_dir }),
        stdin_open: true,
        tty: true,
        networks: [networkName],
      },
    },
    networks: {
      [networkName]: {},
    },
  };

  writeDockerComposeYamlToFile(config, ymlOutputDist);
}
