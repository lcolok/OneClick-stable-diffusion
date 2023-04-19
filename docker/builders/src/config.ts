import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

const configFile = path.join(__dirname, "./config.yaml");
const config = yaml.load(fs.readFileSync(configFile, "utf8")) as {
  dockerfilesPath: string;
  baseBuildConfig: BuildConfigType;
};

const dockerfilesPath = config.dockerfilesPath;
const baseBuildConfig = config.baseBuildConfig;

export type BuildConfigType = {
  [key: string]: {
    tag: string;
    dockerfile: string;
    dockerfilePath?: string;
    label: string;
    hint?: string;
    dependencies?: string[];
  };
};

// 修改后的自动生成 dockerfilePath 的函数
function generateDockerfilePath(path: string, dockerfile: string): string {
  return `${path}/${dockerfile}`;
}

// 构建包含 dockerfilePath 的新 buildConfig 对象的函数
function generateBuildConfigWithDockerfilePath(
  config: BuildConfigType,
  path: string
): BuildConfigType {
  const newConfig: BuildConfigType = {};

  for (const key in config) {
    newConfig[key] = {
      ...config[key],
      dockerfilePath: generateDockerfilePath(path, config[key].dockerfile),
    };
  }

  return newConfig;
}

// 传入路径生成新的 buildConfig 对象
export const buildConfig = generateBuildConfigWithDockerfilePath(
  baseBuildConfig,
  dockerfilesPath
);

// 根据 buildConfig 生成 projectOptions 数组
export const projectOptions = Object.keys(buildConfig).map((key) => {
  const { label, hint } = buildConfig[key];
  return {
    value: key,
    label,
    ...(hint && { hint }),
  };
});
