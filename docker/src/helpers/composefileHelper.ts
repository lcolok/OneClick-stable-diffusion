import path from 'path';
import { DockerComposeOptions, Environment, EnvironmentConfig } from '@types';
import { dockerComposeGen, buildConfig } from '@utils';
import { path as projectRootDir } from 'app-root-path';
import { generatedVolumesForSdWebUI } from '@helpers';

export async function generateComposeFile(
  targetBuild: string,
  environment: Environment,
  environments: Record<Environment, EnvironmentConfig>,
): Promise<DockerComposeOptions> {
  const { env, jupyterPort, sdWebUIPort, lamaCleanerPort } =
    environments[environment];
  const launchDockerfile = buildConfig[targetBuild][
    'launchDockerfile'
  ] as string;

  const projectName = 'sd' + '_' + env;
  const serviceName = 'sd_service' + '_' + env;
  const composeFilePath = path.join(
    projectRootDir,
    'temp',
    `docker-compose.${environment}.temp.yaml`,
  );

  dockerComposeGen({
    ymlOutputDist: composeFilePath,
    networkName: 'network' + '_' + env,
    services: [
      {
        serviceName: 'sd_service' + '_' + env,
        containerName: 'sd_container' + '_' + env,
        launchDockerfile: 'Dockerfile.sdwebui_ext.launch',
        portMappings: {
          JUPYTER_PORT: jupyterPort,
          SDWEBUI_PORT: sdWebUIPort,
        },
        mountVolumes: generatedVolumesForSdWebUI,
      },
      {
        serviceName: 'lama_cleaner' + '_' + env,
        containerName: 'lama_cleaner_container' + '_' + env,
        launchDockerfile: 'Dockerfile.lama_cleaner.launch',
        portMappings: {
          LAMA_CLEANER_PORT: lamaCleanerPort,
        },
        mountVolumes: [
          '/mnt/flies/AI_research/Stable_Diffusion/.cache:/root/.cache',
        ],
      },
    ],
  });

  return { composeFilePath, projectName, serviceName };
}
