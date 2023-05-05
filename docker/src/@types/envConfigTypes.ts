export type Environment = 'test' | 'production';

export interface EnvironmentConfig {
  env: string;
  jupyterPort: number;
  sdWebUIPort: number;
  lamaCleanerPort: number;
}
