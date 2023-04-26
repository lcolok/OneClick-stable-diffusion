import i18next from 'i18next';

i18next.init({
  lng: 'zh_CN', // 默认语言
  debug: false, // 调试模式，生产环境建议关闭
  resources: {
    en_US: {
      translation: require('../locales/en_US.json'),
    },
    zh_CN: {
      translation: require('../locales/zh_CN.json'),
    },
  },
});

export default i18next;
