import * as fs from 'fs';
import { DockerComposeConfig } from 'dockerComposeTypes';
import * as yaml from 'js-yaml';

export function generateDockerComposeYaml(config: DockerComposeConfig): string {
    return JSON.stringify(config);
}

export function writeDockerComposeYamlToFile(
    config: DockerComposeConfig,
    outputPath: string
): void {
    const yamlContent = yaml.dump(JSON.parse(generateDockerComposeYaml(config)));
    fs.writeFileSync(outputPath, yamlContent, { encoding: 'utf-8' });
}
