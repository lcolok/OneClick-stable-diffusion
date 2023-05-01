import { select, isCancel, cancel } from '@clack/prompts';
import path from 'path';
import * as pc from 'picocolors';
import { runCommand } from '@utils/runCommand';
import { buildConfig } from '@utils/imageBuildConfigReader';
import { buildAction } from './build';
import { selectMenu } from '@utils/menuSelection';
import { dockerComposeDown, dockerComposeUp } from '@utils/dockerUtils';
import { dockerComposeGen } from '@modules/dockerComposeGenerator';
import i18next from '@i18n';

async function launchTestImage(): Promise<void> {
  const composeFilePath = path.join(
    'temp',
    'docker-compose.standard.temp.yaml',
  );
  dockerComposeGen({
    ymlOutputDist: composeFilePath,
    containerName: 'test_sdwebui',
    host_sdwebui_dir:
      '/mnt/flies/AI_research/Stable_Diffusion/stable-diffusion-webui-master',
    container_sdwebui_dir: '/home/stable-diffusion-webui',
    portMappings: {
      JUPYTER_PORT: 33333,
      SDWEBUI_PORT: 7860,
    },
  });

  // 停止并删除旧的 Docker 容器
  console.log(i18next.t('STOPPING_AND_REMOVING_DOCKER_CONTAINERS'));
  await dockerComposeDown(composeFilePath);
  console.log(i18next.t('DOCKER_CONTAINERS_STOPPED_AND_REMOVED'));

  // 构建新的镜像
  const selectedConfigKey = 'sdwebui_ext_build';
  const selectedConfig = buildConfig[selectedConfigKey];
  await buildAction({ selectedConfig, selectedConfigKey });

  // 启动新的测试容器
  console.log(i18next.t('STARTING_NEW_TEST_CONTAINER'));
  await dockerComposeUp(composeFilePath, true);
}

async function launchProductionImage(): Promise<void> {
  const dashFilePath = path.join(process.cwd(), './');
  const command = 'python3';
  const args = ['./dash.py', '--name', 'autolaunch', '--port_increment', '1'];

  await runCommand(command, args, { cwd: dashFilePath });
}

export async function launchContainer(): Promise<void> {
  const selectedOperation = await selectMenu({
    message: i18next.t('SELECT_CONTAINER_TO_LAUNCH'),
    operations: [
      {
        label: i18next.t('TEST_CONTAINER.LABEL'),
        action: launchTestImage,
      },
      {
        label: i18next.t('PRODUCTION_CONTAINER.LABEL'),
        hint: pc.bold(pc.yellow(i18next.t('PRODUCTION_CONTAINER.HINT'))),
        action: launchProductionImage,
      },
    ],
  });

  if (selectedOperation?.action) {
    await selectedOperation.action();
  }
}
