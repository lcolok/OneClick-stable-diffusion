import { PortMappingsType } from '@types';

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
  services: ServiceOptions[]; // 使用新的 ServiceInfo 类型替换 serviceName
  runInBackground?: boolean;
  forceRebuild?: boolean;
  forceRestart?: boolean;
}

export interface ServiceOptions {
  serviceName: string;
  containerName?: string;
  launchDockerfile: string;
  mountVolumes?: string[];
  portMappings: PortMappingsType;
}

export interface DockerComposeGenOptions {
  composeFilePath: string;
  networkName: string;
  services: ServiceOptions[];
}
