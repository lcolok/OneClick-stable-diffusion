export type Environment = 'test' | 'production';

export interface EnvironmentConfig {
  env: string;
  JUPYTER_PORT: number;
  SDWEBUI_PORT: number;
  LAMA_CLEANER_PORT: number;
}
