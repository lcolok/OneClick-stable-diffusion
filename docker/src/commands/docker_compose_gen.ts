import { dockerComposeGen } from '@modules/dockerComposeGenerator';
import path from 'path';

export async function gen(): Promise<void> {
  const composeFilePath = path.join(
    'temp',
    'docker-compose.standard.temp.yaml',
  );
  dockerComposeGen(composeFilePath); // 生成 docker-compose.yaml 文件
}
