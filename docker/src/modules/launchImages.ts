import {
  dockerComposeDown,
  dockerComposeUp,
  removeOldContainer,
  handleExistingScreenSession,
  generateTestComposeFile,
  generateProductionComposeFile,
  buildAction,
  buildConfig,
} from '@utils';
import * as pc from 'picocolors';
import i18next from '@i18n';

export async function launchTestImage(): Promise<void> {
  const targetBuild = 'lama_cleaner_build';
  // 构建Compose文件
  const { composeFilePath, containerName, serviceName, projectName } =
    await generateTestComposeFile(targetBuild);
  // 构建新的镜像
  await buildAction({
    selectedConfig: buildConfig[targetBuild],
    selectedConfigKey: targetBuild,
  });

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

export async function launchProductionImage(): Promise<void> {
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
