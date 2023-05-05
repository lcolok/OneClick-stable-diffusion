import {
  handleExistingScreenSession,
  globalConfig,
  buildActionMultiple,
} from '@utils';
import {
  generateTestComposeFile,
  generateProductionComposeFile,
} from '@modules';
import * as pc from 'picocolors';
import i18next from '@i18n';

async function launchImage({
  generateComposeFile,
  testMode,
}: {
  generateComposeFile: () => Promise<any>;
  testMode?: boolean;
}): Promise<void> {
  // 构建Compose文件
  const { composeFilePath, serviceName, projectName } =
    await generateComposeFile();
  // 批量构建新的镜像
  const targetBuilds = globalConfig.targetBuilds;
  await buildActionMultiple(targetBuilds);

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
