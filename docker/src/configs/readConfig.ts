import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import nunjucks from 'nunjucks';
import { GlobalConfigTypes } from '@types';
import { generateBuildConfigTypesWithDockerfilePath } from './imageBuildConfig';

const configFile = path.join(__dirname, './globalConfig.yaml');
const yamlContent = fs.readFileSync(configFile, 'utf8');

const rawConfig = yaml.load(yamlContent) as any;
const config = {
  dockerBuildConfig: {},
  templateVariables: {},
  ...rawConfig,
};

if (config.templateVariables) {
  const env = nunjucks.configure({
    tags: { variableStart: '${', variableEnd: '}' },
  });
  config.templateVariables = env.renderString(
    JSON.stringify(config.templateVariables),
    config.templateVariables,
  );
  config.templateVariables = JSON.parse(config.templateVariables);
}

for (const key in config.dockerBuildConfig) {
  const buildConfig = config.dockerBuildConfig[key];
  const serviceOptions = buildConfig.serviceOptions;
  if (serviceOptions && serviceOptions.mountVolumes) {
    const env = nunjucks.configure({
      tags: { variableStart: '${', variableEnd: '}' },
    });
    buildConfig.serviceOptions.mountVolumes = serviceOptions.mountVolumes.map(
      (volume: string) => env.renderString(volume, config.templateVariables),
    );
  }
}

const buildList = Object.keys(config.dockerBuildConfig).filter((key) => {
  const buildConfig = config.dockerBuildConfig[key];
  const serviceOptions = buildConfig.serviceOptions;
  return (
    buildConfig.endpointBuild &&
    serviceOptions &&
    (serviceOptions.launch?.prod || serviceOptions.launch?.test)
  );
});

const buildConfig = generateBuildConfigTypesWithDockerfilePath(config);
const projectOptions = Object.keys(buildConfig).map((key) => {
  const { label, hint, serviceOptions } = buildConfig[key];
  return {
    value: key,
    label,
    ...(hint && { hint }),
    ...(serviceOptions && { serviceOptions }),
  };
});

export const globalConfig: GlobalConfigTypes = {
  ...config,
  buildList,
  buildConfig,
  projectOptions,
};
