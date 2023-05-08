import path from 'path';
import {
  DockerComposeOptions,
  Environment,
  EnvironmentConfig,
  ServiceOptions,
} from '@types';
import { dockerComposeGen } from '@utils';
import { path as projectRootDir } from 'app-root-path';
import { generatedVolumesForSdWebUI } from '@helpers';

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
  environments: Record<Environment, EnvironmentConfig>,
): Promise<DockerComposeOptions> {
  const { env, JUPYTER_PORT, SDWEBUI_PORT, LAMA_CLEANER_PORT, COMFYUI_PORT } =
    environments[environment];

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
        JUPYTER_PORT: JUPYTER_PORT,
        SDWEBUI_PORT: SDWEBUI_PORT,
      },
      mountVolumes: generatedVolumesForSdWebUI,
    },
    {
      serviceName: 'lama_cleaner',
      containerName: 'lama_cleaner_container',
      launchDockerfile: 'Dockerfile.lama_cleaner.launch',
      portMappings: {
        LAMA_CLEANER_PORT: LAMA_CLEANER_PORT,
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
        COMFYUI_PORT: COMFYUI_PORT,
      },
      mountVolumes: [
        '/mnt/flies/AI_research/Stable_Diffusion/.cache:/root/.cache',
        '/mnt/flies/AI_research/Stable_Diffusion/ComfyUI/models:/home/ComfyUI/models',
        '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master/models/Stable-diffusion:/home/ComfyUI/models/checkpoints',
        '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master/extensions/sd-webui-controlnet/models:/home/ComfyUI/models/controlnet',
        '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master/models/Lora:/home/ComfyUI/models/loras',
      ],
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
