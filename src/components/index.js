import PageList from './PageList';
import Block from './Block';
import CellInput from './CellInput';
import DatePicker from './DatePicker';
import Swipe from './Swipe';
import SwipeItem from './SwipeItem';
import IndexList from './IndexList';
import IndexSection from './IndexSection';
import EmptyBox from './EmptyBox';
import Stick from './Stick';
import Header from './Header';
import WalletAddr from './WalletAddr';
import ContentBlock from './ContentBlock';
import PasswordStrength from './PasswordStrength';
import Privacy from './privacy';

const install = function (Vue) {
  /* istanbul ignore if */
  if (install.installed) return;
  Vue.component(PageList.name, PageList);
  Vue.component(CellInput.name, CellInput);
  Vue.component(Block.name, Block);
  Vue.component(DatePicker.name, DatePicker);
  Vue.component(SwipeItem.name, SwipeItem);
  Vue.component(Swipe.name, Swipe);
  Vue.component(IndexList.name, IndexList);
  Vue.component(IndexSection.name, IndexSection);
  Vue.component(EmptyBox.name, EmptyBox);
  Vue.component(Stick.name, Stick);
  Vue.component(Header.name, Header);
  Vue.component(WalletAddr.name, WalletAddr);
  Vue.component(ContentBlock.name, ContentBlock);
  Vue.component(PasswordStrength.name, PasswordStrength);
  Vue.component(Privacy.name, Privacy);
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install
};
