import { Locale } from 'vant';
import enUS from 'vant/lib/locale/lang/en-US';
import zhCN from 'vant/lib/locale/lang/zh-CN';

export default (language) => {
  if (language === 'en-US') {
    Locale.use(language, enUS);
  } else if (language === 'zh-CN') {
    Locale.use(language, zhCN);
  } else if (language === 'ja-JP') {
    const jaJP = {
      confirm: '確認',
      cancel: 'キャンセル'
    };
    Locale.use(language, jaJP);
  } else if (language === 'ko-KO') {
    const koKO = {
      confirm: '확인',
      cancel: '취소'
    };
    Locale.use(language, koKO);
  }
};
