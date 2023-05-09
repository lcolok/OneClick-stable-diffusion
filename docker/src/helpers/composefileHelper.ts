import path from 'path';
import {
  DockerComposeOptions,
  Environment,
  EnvironmentConfig,
  ServiceOptions,
} from '@types';
import { dockerComposeGen } from '@utils';
import { path as projectRootDir } from 'app-root-path';
import {
  generatedVolumesForSdWebUI,
  generatedVolumesForComfyUI,
} from '@helpers';

function generateTestServices(
  productionServices: ServiceOptions[],
  offset: number,
): ServiceOptions[] {
  return productionServices.map((service) => {
    const testService = { ...service };
    testService.portMappings = Object.fromEntries(
      Object.entries(service.portMappings).map(([key, value]) => [
        key,
        typeof value === 'number' ? value + offset : value,
      ]),
    );
    return testService;
  });
}

const productionServices: ServiceOptions[] = [
  {
    serviceName: 'sd_service',
    containerName: 'sd_container',
    launchDockerfile: 'Dockerfile.sdwebui_ext.launch',
    portMappings: {
      JUPYTER_PORT: 33333,
      SDWEBUI_PORT: 7860,
    },
    mountVolumes: generatedVolumesForSdWebUI,
  },
  {
    serviceName: 'lama_cleaner',
    containerName: 'lama_cleaner_container',
    launchDockerfile: 'Dockerfile.lama_cleaner.launch',
    portMappings: {
      LAMA_CLEANER_PORT: 8080,
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
      COMFYUI_PORT: 8188,
    },
    mountVolumes: generatedVolumesForComfyUI,
  },
];

const environments: Record<Environment, EnvironmentConfig> = {
  production: {
    env: 'prod',
    services: productionServices,
  },
  test: {
    env: 'test',
    services: generateTestServices(productionServices, 1), // Replace 1 with your desired offset
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
  const { env, services } = environments[environment];

  const projectName = 'aiiiiiii' + '_' + env;
  const composeFilePath = path.join(
    projectRootDir,
    'temp',
    `docker-compose.${environment}.temp.yaml`,
  );

  const updatedServices = services.map((service) =>
    addEnvironmentSuffix(service, env),
  );

  dockerComposeGen({
    composeFilePath: composeFilePath,
    networkName: 'network' + '_' + env,
    services: updatedServices,
  });

  return {
    composeFilePath,
    projectName,
    services: updatedServices,
  };
}
