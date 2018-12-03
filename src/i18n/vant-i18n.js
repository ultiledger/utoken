import { Locale } from 'vant';
import enUS from 'vant/lib/locale/lang/en-US';
import zhCN from 'vant/lib/locale/lang/zh-CN';

export default (language) => {
  if (language === 'en-US') {
    Locale.use(language, enUS);
  } else if (language === 'zh-CN') {
    Locale.use(language, zhCN);
  }
};
