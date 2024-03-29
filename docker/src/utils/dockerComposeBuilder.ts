import {
  DockerComposeConfig,
  BuildActionParams,
  DockerComposeGenOptions,
  ServiceOptions,
  PortMappingsType,
} from '@types';
import {
  writeDockerComposeYamlToFile,
  selectDependenciesAndBuildImages,
  printDockerImages,
  pp,
} from '@utils';
import { globalConfig } from '@configs';
import * as path from 'path';
import { path as projectRootDir } from 'app-root-path';
import i18next from '@i18n';
import { outro } from '@clack/prompts';

export async function buildAction({
  selectedConfig,
  selectedConfigKey,
}: BuildActionParams): Promise<void> {
  // 构建镜像
  await selectDependenciesAndBuildImages({ selectedConfig, selectedConfigKey });
  // 打印镜像信息
  await printDockerImages(selectedConfig);
  outro(
    `${pp.success(` ${selectedConfigKey} `)} ${i18next.t(
      'BUILD_SUCCESSFULLY',
    )}` as string,
  );
}

export async function buildActionMultiple(
  targetBuilds: string[],
): Promise<void> {
  for (const targetBuild of targetBuilds) {
    await buildAction({
      selectedConfig: globalConfig.buildConfig[targetBuild],
      selectedConfigKey: targetBuild,
    });
  }
}

function generateEnvironmentAndPorts(portMappings: PortMappingsType) {
  const environment = Object.entries(portMappings).map(
    ([key, value]) => `${key}=${value}`,
  );
  const ports = Object.values(portMappings).map((port) => `${port}:${port}`);
  return { environment, ports };
}

export function dockerComposeGen({
  composeFilePath,
  networkName,
  services,
}: DockerComposeGenOptions): void {
  // 生成 services 配置
  function generateServices(services: ServiceOptions[]): Record<string, any> {
    const dockerfileDir = path.join(projectRootDir, 'dockerfile');
    const servicesConfig: Record<string, any> = {};

    for (const service of services) {
      const { serviceName, containerName, launchDockerfile, portMappings } =
        service;
      const { environment, ports } = generateEnvironmentAndPorts(portMappings);

      servicesConfig[serviceName] = {
        ...(containerName ? { container_name: containerName } : {}),
        build: {
          context: projectRootDir,
          dockerfile: `${dockerfileDir}/launch/${launchDockerfile}`,
        },
        runtime: 'nvidia',
        environment: ['NVIDIA_VISIBLE_DEVICES=all', ...environment],
        ports: ports,
        volumes: service.mountVolumes,
        stdin_open: true,
        tty: true,
        networks: [networkName],
      };
    }
    return servicesConfig;
  }

  const config: DockerComposeConfig = {
    version: '3.8',
    services: generateServices(services),
    networks: {
      [networkName]: {},
    },
  };

  writeDockerComposeYamlToFile(config, composeFilePath);
}
