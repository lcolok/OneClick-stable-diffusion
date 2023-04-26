import i18next from 'i18next';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

function loadYamlFile(language: string, namespace: string) {
  const filePath = path.join(__dirname, './', 'locales', language, `${namespace}.yaml`);
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

const languages = ['en_US', 'zh_CN'];
const namespaces = ['common', 'error'];

const resources: { [key: string]: { [key: string]: any } } = {};

for (const language of languages) {
  resources[language] = {};
  for (const namespace of namespaces) {
    resources[language][namespace] = loadYamlFile(language, namespace);
  }
}

i18next.init({
  lng: 'zh_CN', // 默认语言
  debug: false, // 调试模式，生产环境建议关闭
  defaultNS: 'common', // 默认命名空间
  resources,
});

export default i18next;
