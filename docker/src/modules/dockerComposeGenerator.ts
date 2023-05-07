import * as pc from 'picocolors';
import i18next from '@i18n';
import { DockerComposeOptions, Environment, EnvironmentConfig } from '@types';
import { generateComposeFile } from '@helpers';

const environments: Record<Environment, EnvironmentConfig> = {
  test: {
    env: 'test',
    JUPYTER_PORT: 33334,
    SDWEBUI_PORT: 7861,
    LAMA_CLEANER_PORT: 8081,
    COMFYUI_PORT: 8189,
  },
  production: {
    env: 'prod',
    JUPYTER_PORT: 33333,
    SDWEBUI_PORT: 7860,
    LAMA_CLEANER_PORT: 8080,
    COMFYUI_PORT: 8188,
  },
};

export async function generateTestComposeFile(): Promise<DockerComposeOptions> {
  console.log(pc.inverse(pc.green(i18next.t('GENERATING_TEST_COMPOSE_FILE'))));
  return generateComposeFile('test', environments);
}

export async function generateProductionComposeFile(): Promise<DockerComposeOptions> {
  console.log(
    pc.inverse(pc.green(i18next.t('GENERATING_PRODUCTION_COMPOSE_FILE'))),
  );
  return generateComposeFile('production', environments);
}
