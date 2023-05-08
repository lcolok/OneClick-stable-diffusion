export type Environment = 'test' | 'production';

export interface Ports {
  [key: string]: number;
}

export interface EnvironmentConfig {
  env: string;
  ports: Ports;
}

export type PortMappingsType = Partial<Record<string, number>>;
