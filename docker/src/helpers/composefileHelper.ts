import path from 'path';
import {
  DockerComposeOptions,
  Environment,
  EnvironmentConfig,
  ServiceOptions,
  Ports,
} from '@types';
import { dockerComposeGen } from '@utils';
import { path as projectRootDir } from 'app-root-path';
import {
  generatedVolumesForSdWebUI,
  generatedVolumesForComfyUI,
} from '@helpers';

function generateTestPorts(productionPorts: Ports, offset: number): Ports {
  return Object.fromEntries(
    Object.entries(productionPorts).map(([key, value]) => [
      key,
      value + offset,
    ]),
  ) as Ports;
}

const productionPorts: Ports = {
  JUPYTER_PORT: 33333,
  SDWEBUI_PORT: 7860,
  LAMA_CLEANER_PORT: 8080,
  COMFYUI_PORT: 8188,
  // Add more ports here
};

const environments: Record<Environment, EnvironmentConfig> = {
  production: {
    env: 'prod',
    ports: productionPorts,
  },
  test: {
    env: 'test',
    ports: generateTestPorts(productionPorts, 1), // Replace 1 with your desired offset
  },
};

function addEnvironmentSuffix(
  service: ServiceOptions,
  env: string,
): ServiceOptions {
  service.serviceName += '_' + env;
  service.containerName += '_' + env;
  return service;
}

export async function generateComposeFile(
  environment: Environment,
): Promise<DockerComposeOptions> {
  const { env, ports } = environments[environment];

  const projectName = 'ai' + '_' + env;
  const composeFilePath = path.join(
    projectRootDir,
    'temp',
    `docker-compose.${environment}.temp.yaml`,
  );
  const services: ServiceOptions[] = [
    {
      serviceName: 'sd_service',
      containerName: 'sd_container',
      launchDockerfile: 'Dockerfile.sdwebui_ext.launch',
      portMappings: {
        JUPYTER_PORT: ports.JUPYTER_PORT,
        SDWEBUI_PORT: ports.SDWEBUI_PORT,
      },
      mountVolumes: generatedVolumesForSdWebUI,
    },
    {
      serviceName: 'lama_cleaner',
      containerName: 'lama_cleaner_container',
      launchDockerfile: 'Dockerfile.lama_cleaner.launch',
      portMappings: {
        LAMA_CLEANER_PORT: ports.LAMA_CLEANER_PORT,
      },
      mountVolumes: [
        '/mnt/flies/AI_research/Stable_Diffusion/.cache:/root/.cache',
      ],
    },
    {
      serviceName: 'comfyui',
      containerName: 'comfyui_container',
      launchDockerfile: 'Dockerfile.comfyui.launch',
      portMappings: {
        COMFYUI_PORT: ports.COMFYUI_PORT,
      },
      mountVolumes: generatedVolumesForComfyUI,
    },
  ].map((service) => addEnvironmentSuffix(service, env));

  dockerComposeGen({
    composeFilePath: composeFilePath,
    networkName: 'network' + '_' + env,
    services: services,
  });

  return {
    composeFilePath,
    projectName,
    services,
  };
}
