import * as pc from 'picocolors';
import i18next from '@i18n';
import { DockerComposeOptions } from '@types';
import { generateComposeFile } from '@helpers';

export async function generateTestComposeFile(): Promise<DockerComposeOptions> {
  console.log(pc.inverse(pc.green(i18next.t('GENERATING_TEST_COMPOSE_FILE'))));
  return generateComposeFile('test');
}

export async function generateProductionComposeFile(): Promise<DockerComposeOptions> {
  console.log(
    pc.inverse(pc.green(i18next.t('GENERATING_PRODUCTION_COMPOSE_FILE'))),
  );
  return generateComposeFile('production');
}
