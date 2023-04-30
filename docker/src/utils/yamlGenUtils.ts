import * as fs from 'fs';
import { DockerComposeConfig } from 'dockerComposeTypes';
import * as yaml from 'js-yaml';
import * as path from 'path';

export function generateDockerComposeYaml(config: DockerComposeConfig): string {
    return JSON.stringify(config);
}

export function writeDockerComposeYamlToFile(
    config: DockerComposeConfig,
    outputPath: string
): void {
    const yamlContent = yaml.dump(JSON.parse(generateDockerComposeYaml(config)));
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, yamlContent, { encoding: 'utf-8' });
}