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

export interface ServiceOptions {
  serviceName: string;
  containerName?: string;
  launchDockerfile: string;
  mountVolumes?: string[];
  portMappings: Record<string, number>;
}

export interface DockerComposeGenOptions {
  ymlOutputDist: string;
  networkName: string;
  services: ServiceOptions[];
}
