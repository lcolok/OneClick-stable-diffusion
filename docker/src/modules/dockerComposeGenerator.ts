import path from 'path';
import * as pc from 'picocolors';
import { dockerComposeGen, buildConfig } from '@utils';
import i18next from '@i18n';
import { path as projectRootDir } from 'app-root-path';
import { DockerComposeOptions } from '@types';
import { generatedVolumesForSdWebUI } from '@helpers';

export async function generateTestComposeFile(
  targetBuild: string,
): Promise<DockerComposeOptions> {
  const launchDockerfile = buildConfig[targetBuild][
    'launchDockerfile'
  ] as string;

  const env = '_test';

  const projectName = 'sd' + env;
  const serviceName = 'sd_service' + env;

  const composeFilePath = path.join(
    projectRootDir,
    'temp',
    'docker-compose.test.temp.yaml',
  );

  console.log(pc.inverse(pc.green(i18next.t('GENERATING_TEST_COMPOSE_FILE'))));

  dockerComposeGen({
    ymlOutputDist: composeFilePath,
    networkName: 'network' + env,
    services: [
      {
        serviceName: 'sd_service' + env, // 服务名
        containerName: 'sd_container' + env, // 容器名
        launchDockerfile: 'Dockerfile.sdwebui_ext.launch', // 对应的 Dockerfile 名
        portMappings: {
          JUPYTER_PORT: 33334,
          SDWEBUI_PORT: 7861,
        },
        mountVolumes: generatedVolumesForSdWebUI,
      },
      {
        serviceName: 'lama_cleaner' + env, // 服务名
        containerName: 'lama_cleaner_container' + env, // 容器名
        launchDockerfile: 'Dockerfile.lama_cleaner.launch', // 对应的 Dockerfile 名
        portMappings: {
          LAMA_CLEANER_PORT: 8081,
        },
        mountVolumes: [
          '/mnt/flies/AI_research/Stable_Diffusion/.cache:/root/.cache',
        ],
      },
    ],
  });

  return { composeFilePath, projectName, serviceName };
}

export async function generateProductionComposeFile(
  targetBuild: string,
): Promise<DockerComposeOptions> {
  const launchDockerfile = buildConfig[targetBuild][
    'launchDockerfile'
  ] as string;

  const env = '_prod';

  const projectName = 'sd' + env;
  const serviceName = 'sd_service' + env;

  const composeFilePath = path.join(
    projectRootDir,
    'temp',
    'docker-compose.prod.temp.yaml',
  );

  console.log(
    pc.inverse(pc.green(i18next.t('GENERATING_PRODUCTION_COMPOSE_FILE'))),
  );

  dockerComposeGen({
    ymlOutputDist: composeFilePath,
    networkName: 'network' + env,
    services: [
      {
        serviceName: 'sd_service' + env, // 服务名
        containerName: 'sd_container' + env, // 容器名
        launchDockerfile: 'Dockerfile.sdwebui_ext.launch', // 对应的 Dockerfile 名
        portMappings: {
          JUPYTER_PORT: 33333,
          SDWEBUI_PORT: 7860,
        },
        mountVolumes: generatedVolumesForSdWebUI,
      },
      {
        serviceName: 'lama_cleaner' + env, // 服务名
        containerName: 'lama_cleaner_container' + env, // 容器名
        launchDockerfile: 'Dockerfile.lama_cleaner.launch', // 对应的 Dockerfile 名
        portMappings: {
          LAMA_CLEANER_PORT: 8080,
        },
        mountVolumes: [
          '/mnt/flies/AI_research/Stable_Diffusion/.cache:/root/.cache',
        ],
      },
    ],
  });

  return { composeFilePath, projectName, serviceName };
}
