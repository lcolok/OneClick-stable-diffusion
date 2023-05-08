import { ServiceOptions } from '@types';

export type Environment = 'test' | 'production';

export interface Ports {
  [key: string]: number;
}

export interface EnvironmentConfig {
  env: string;
  services: ServiceOptions[];
}

export type PortMappingsType = Partial<Record<string, number>>;
