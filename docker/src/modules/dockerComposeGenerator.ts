import * as pc from 'picocolors';
import i18next from '@i18n';
import { DockerComposeOptions, Environment, EnvironmentConfig } from '@types';
import { generateComposeFile } from '@helpers';

const environments: Record<Environment, EnvironmentConfig> = {
  test: {
    env: 'test',
    jupyterPort: 33334,
    sdWebUIPort: 7861,
    lamaCleanerPort: 8081,
  },
  production: {
    env: 'prod',
    jupyterPort: 33333,
    sdWebUIPort: 7860,
    lamaCleanerPort: 8080,
  },
};

export async function generateTestComposeFile(
  targetBuild: string,
): Promise<DockerComposeOptions> {
  console.log(pc.inverse(pc.green(i18next.t('GENERATING_TEST_COMPOSE_FILE'))));
  return generateComposeFile(targetBuild, 'test', environments);
}

export async function generateProductionComposeFile(
  targetBuild: string,
): Promise<DockerComposeOptions> {
  console.log(
    pc.inverse(pc.green(i18next.t('GENERATING_PRODUCTION_COMPOSE_FILE'))),
  );
  return generateComposeFile(targetBuild, 'production', environments);
}
