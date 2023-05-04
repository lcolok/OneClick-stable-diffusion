export interface DockerComposeConfig {
  version: string;
  services: {
    [serviceName: string]: {
      build?: {
        context?: string;
        dockerfile?: string;
        args?: {
          [key: string]: string;
        };
      };
      image?: string;
      runtime?: string;
      environment?: string[];
      ports?: string[];
      volumes?: string[];
      stdin_open?: boolean;
      tty?: boolean;
      networks?: string[];
      [key: string]: any;
    };
  };
  networks?: {
    [networkName: string]: {};
  };
}

export interface DockerComposeOptions {
  composeFilePath: string;
  projectName: string;
  containerName: string;
  serviceName: string;
  runInBackground?: boolean;
  forceRebuild?: boolean;
  forceRestart?: boolean;
}

export interface DockerComposeGenOptions {
  ymlOutputDist: string;
  serviceName: string;
  containerName?: string;
  networkName: string;
  host_sdwebui_dir: string;
  container_sdwebui_dir: string;
  portMappings: Record<string, number>;
  launchDockerfile: string;
}
