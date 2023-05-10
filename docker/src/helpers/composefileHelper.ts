import path from 'path';
import {
  DockerComposeOptions,
  Environment,
  EnvironmentConfig,
  ServiceOptions,
  BuildConfigTypes,
} from '@types';
import { dockerComposeGen } from '@utils';
import { path as projectRootDir } from 'app-root-path';
import { globalConfig } from '@configs';

function generateTestServices(
  productionServices: ServiceOptions[],
  offset: number,
): ServiceOptions[] {
  return productionServices.map((service) => {
    const testService = { ...service };
    testService.portMappings = Object.fromEntries(
      Object.entries(service.portMappings).map(([key, value]) => [
        key,
        typeof value === 'number' ? value + offset : value,
      ]),
    );
    return testService;
  });
}

const productionServices: ServiceOptions[] = globalConfig.projectOptions
  .filter(
    (option: BuildConfigTypes) =>
      option.serviceOptions !== undefined && option.launchProd,
  )
  .map((option: BuildConfigTypes) => option.serviceOptions) as ServiceOptions[];

const testServices: ServiceOptions[] = globalConfig.projectOptions
  .filter(
    (option: BuildConfigTypes) =>
      option.serviceOptions !== undefined && option.launchTest,
  )
  .map((option: BuildConfigTypes) => option.serviceOptions) as ServiceOptions[];

// console.log(globalConfig.projectOptions);
// console.log(productionServices);
// console.log(testServices);

const environments: Record<Environment, EnvironmentConfig> = {
  production: {
    env: 'prod',
    services: productionServices,
  },
  test: {
    env: 'test',
    services: generateTestServices(testServices, 1), // Replace 1 with your desired offset
  },
};

function addEnvironmentSuffix(
  service: ServiceOptions,
  env: string,
): ServiceOptions {
  service.serviceName += '_' + env;
  service.containerName += '_' + env;
  return service;
}

export async function generateComposeFile(
  environment: Environment,
): Promise<DockerComposeOptions> {
  const { env, services } = environments[environment];

  const projectName = 'ai' + '_' + env;
  const composeFilePath = path.join(
    projectRootDir,
    'temp',
    `docker-compose.${environment}.temp.yaml`,
  );

  const updatedServices = services.map((service) =>
    addEnvironmentSuffix(service, env),
  );

  dockerComposeGen({
    composeFilePath: composeFilePath,
    networkName: 'network' + '_' + env,
    services: updatedServices,
  });

  return {
    composeFilePath,
    projectName,
    services: updatedServices,
  };
}
