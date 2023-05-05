import {
  handleExistingScreenSession,
  buildAction,
  buildConfig,
  globalConfig,
} from '@utils';
import {
  generateTestComposeFile,
  generateProductionComposeFile,
} from '@modules';
import * as pc from 'picocolors';
import i18next from '@i18n';

const targetBuild = globalConfig.targetBuild;

async function launchImage({
  generateComposeFile,
  testMode,
}: {
  generateComposeFile: (targetBuild: string) => Promise<any>;
  testMode?: boolean;
}): Promise<void> {
  // 构建Compose文件
  const { composeFilePath, serviceName, projectName } =
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
    forceRebuild: testMode ? true : false,
    forceRestart: testMode ? true : false,
  });
}

export async function launchTestImage(): Promise<void> {
  await launchImage({
    generateComposeFile: generateTestComposeFile,
    testMode: true,
  });
}

export async function launchProductionImage(): Promise<void> {
  // 启动新的测试容器
  console.log(pc.inverse(pc.green(i18next.t('STARTING_NEW_PROD_CONTAINER'))));

  await launchImage({
    generateComposeFile: generateProductionComposeFile,
  });
}
