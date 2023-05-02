// composeConfig.ts

import path from 'path';
import { buildConfig, buildAction } from '@utils';
import * as pc from 'picocolors';
import { dockerComposeGen } from '@utils';
import i18next from '@i18n';

export async function generateTestComposeFile(): Promise<{
  composeFilePath: string;
  containerName: string;
  projectName: string;
}> {
  // 构建新的镜像
  const selectedConfigKey = 'sdwebui_ext_build';
  const selectedConfig = buildConfig[selectedConfigKey];
  await buildAction({ selectedConfig, selectedConfigKey });

  const projectName = 'sd_test';
  const serviceName = 'sd_test_service';
  const containerName = 'sd_test_container';
  const networkName = 'sd_test_network';

  const composeFilePath = path.join('temp', 'docker-compose.test.temp.yaml');

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
    },
  });

  return { composeFilePath, containerName, projectName };
}

export async function generateProductionComposeFile(): Promise<{
  composeFilePath: string;
  containerName: string;
  projectName: string;
}> {
  const projectName = 'sd_prod';
  const serviceName = 'sd_prod_service';
  const containerName = 'sd_prod_container';
  const networkName = 'sd_prod_network';

  const composeFilePath = path.join('temp', 'docker-compose.prod.temp.yaml');

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
    },
  });

  return { composeFilePath, containerName, projectName };
}
