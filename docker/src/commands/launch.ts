import * as pc from 'picocolors';
import { selectMenu } from '@utils';
import {
  dockerComposeDown,
  dockerComposeUp,
  removeOldContainer,
  handleExistingScreenSession,
  generateTestComposeFile,
  generateProductionComposeFile,
} from '@utils';
import i18next from '@i18n';

async function launchTestImage(): Promise<void> {
  // 构建新的镜像
  const { composeFilePath, containerName, serviceName, projectName } =
    await generateTestComposeFile();
  // 停止并删除旧的 Docker 容器
  console.log(i18next.t('STOPPING_AND_REMOVING_DOCKER_CONTAINERS'));
  await dockerComposeDown({
    composeFilePath,
    serviceName,
    projectName,
    containerName,
  });
  await removeOldContainer({ containerName });
  console.log(i18next.t('DOCKER_CONTAINERS_STOPPED_AND_REMOVED'));

  // 启动新的测试容器
  console.log(pc.inverse(pc.green(i18next.t('STARTING_NEW_TEST_CONTAINER'))));
  await dockerComposeUp({
    composeFilePath,
    serviceName,
    projectName,
    containerName,
    build: 'force',
  });
}

async function launchProductionImage(): Promise<void> {
  // 构建新的镜像
  const { composeFilePath, serviceName, projectName, containerName } =
    await generateProductionComposeFile();

  // 启动新的测试容器
  console.log(pc.inverse(pc.green(i18next.t('STARTING_NEW_PROD_CONTAINER'))));

  await handleExistingScreenSession({
    composeFilePath,
    serviceName,
    projectName,
    containerName,
    build: 'auto',
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
