import path from 'path';
import * as pc from 'picocolors';
import { dockerComposeGen, buildConfig } from '@utils';
import i18next from '@i18n';
import { path as projectRootDir } from 'app-root-path';
import { DockerComposeOptions } from '@types';

export async function generateTestComposeFile(
  targetBuild: string,
): Promise<DockerComposeOptions> {
  const launchDockerfile = buildConfig[targetBuild][
    'launchDockerfile'
  ] as string;

  const projectName = 'sd_test';
  const serviceName = 'sd_test_service';
  const containerName = 'sd_test_container';
  const networkName = 'sd_test_network';

  const composeFilePath = path.join(
    projectRootDir,
    'temp',
    'docker-compose.test.temp.yaml',
  );

  console.log(pc.inverse(pc.green(i18next.t('GENERATING_TEST_COMPOSE_FILE'))));

  dockerComposeGen({
    ymlOutputDist: composeFilePath,
    serviceName,
    containerName,
    networkName,
    host_sdwebui_dir:
      '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master',
    container_sdwebui_dir: '/home/stable-diffusion-webui',
    portMappings: {
      JUPYTER_PORT: 33334,
      SDWEBUI_PORT: 7861,
      LAMA_CLEANER_PORT: 8081,
    },
    launchDockerfile,
  });

  return { composeFilePath, containerName, projectName, serviceName };
}

export async function generateProductionComposeFile(
  targetBuild: string,
): Promise<DockerComposeOptions> {
  const launchDockerfile = buildConfig[targetBuild][
    'launchDockerfile'
  ] as string;

  const projectName = 'sd_prod';
  const serviceName = 'sd_prod_service';
  const containerName = 'sd_prod_container';
  const networkName = 'sd_prod_network';

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
    serviceName,
    containerName,
    networkName,
    host_sdwebui_dir:
      '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master',
    container_sdwebui_dir: '/home/stable-diffusion-webui',
    portMappings: {
      JUPYTER_PORT: 33333,
      SDWEBUI_PORT: 7860,
      LAMA_CLEANER_PORT: 8080,
    },
    launchDockerfile,
  });

  return { composeFilePath, containerName, projectName, serviceName };
}
