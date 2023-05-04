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

const targetBuild = 'lama_cleaner_build';

async function launchImage({
  generateComposeFile,
  buildMode,
}: {
  generateComposeFile: (targetBuild: string) => Promise<any>;
  buildMode: 'force' | 'auto';
}): Promise<void> {
  // 构建Compose文件
  const { composeFilePath, containerName, serviceName, projectName } =
    await generateComposeFile(targetBuild);
  // 构建新的镜像
  await buildAction({
    selectedConfig: buildConfig[targetBuild],
    selectedConfigKey: targetBuild,
  });

  await handleExistingScreenSession({
    composeFilePath,
    serviceName,
    projectName,
    containerName,
    build: buildMode,
    forceRestart: buildMode === 'force',
  });
}

export async function launchTestImage(): Promise<void> {
  await launchImage({
    generateComposeFile: generateTestComposeFile,
    buildMode: 'force',
  });
}

export async function launchProductionImage(): Promise<void> {
  // 启动新的测试容器
  console.log(pc.inverse(pc.green(i18next.t('STARTING_NEW_PROD_CONTAINER'))));

  await launchImage({
    generateComposeFile: generateProductionComposeFile,
    buildMode: 'auto',
  });
}
