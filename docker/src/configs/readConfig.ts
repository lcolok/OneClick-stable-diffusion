import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import nunjucks from 'nunjucks';
import { GlobalConfigTypes, BuildConfigTypes } from '@types';
import { generateBuildConfigTypesWithDockerfilePath } from './imageBuildConfig';

const configFile = path.join(__dirname, './globalConfig.yaml');
const yamlContent = fs.readFileSync(configFile, 'utf8');

const parsedYaml = yaml.load(yamlContent) as any;
const templateVariables = parsedYaml.templateVariables;

delete parsedYaml.templateVariables;

const env = nunjucks.configure({
  tags: { variableStart: '${', variableEnd: '}' },
});

// Render strings in arrays
for (const key in parsedYaml.dockerBuildConfig) {
  const serviceOptions = parsedYaml.dockerBuildConfig[key].serviceOptions;
  if (serviceOptions && serviceOptions.mountVolumes) {
    serviceOptions.mountVolumes = serviceOptions.mountVolumes.map(
      (volume: string) => env.renderString(volume, templateVariables),
    );
  }
}

const replacedYamlContent = env.renderString(
  yaml.dump(parsedYaml),
  templateVariables,
);

const parsedGlobalConfig = yaml.load(replacedYamlContent) as GlobalConfigTypes;

const buildList = Object.keys(parsedGlobalConfig.dockerBuildConfig).filter(
  (key) => parsedGlobalConfig.dockerBuildConfig[key].endpointBuild,
);

// console.log(parsedGlobalConfig.dockerBuildConfig.sdwebui_ext_build.serviceOptions.mountVolumes);

const buildConfig =
  generateBuildConfigTypesWithDockerfilePath(parsedGlobalConfig);

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
  ...parsedGlobalConfig,
  buildList: buildList,
  buildConfig: buildConfig,
  projectOptions: projectOptions,
};
