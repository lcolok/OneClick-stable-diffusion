import { select, isCancel, cancel } from '@clack/prompts';
import path from 'path';
import * as pc from 'picocolors';
import { buildConfig, buildAction, selectMenu } from '@utils';
import {
  dockerComposeDown,
  dockerComposeUp,
  removeOldContainer,
  handleExistingScreenSession,
  generateTestComposeFile,
  generateProductionComposeFile,
} from '@utils';
import { dockerComposeGen } from '@utils';
import i18next from '@i18n';

async function launchTestImage(): Promise<void> {
  // 构建新的镜像
  const { composeFilePath, containerName, projectName } =
    await generateTestComposeFile();
  // 停止并删除旧的 Docker 容器
  console.log(i18next.t('STOPPING_AND_REMOVING_DOCKER_CONTAINERS'));
  await dockerComposeDown({ composeFilePath, containerName, projectName });
  await removeOldContainer({ containerName });
  console.log(i18next.t('DOCKER_CONTAINERS_STOPPED_AND_REMOVED'));

  // 启动新的测试容器
  console.log(pc.inverse(pc.green(i18next.t('STARTING_NEW_TEST_CONTAINER'))));
  await dockerComposeUp({
    composeFilePath,
    projectName,
    containerName,
    // build: true
  });
}

async function launchProductionImage(): Promise<void> {
  // 构建新的镜像
  const { composeFilePath, containerName, projectName } =
    await generateProductionComposeFile();

  // 启动新的测试容器
  console.log(pc.inverse(pc.green(i18next.t('STARTING_NEW_PROD_CONTAINER'))));

  await handleExistingScreenSession({
    composeFilePath,
    projectName,
    containerName,
    build: true,
  });
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
