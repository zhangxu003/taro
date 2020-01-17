/**
 * 进行taro的处理 
 * 1.方法的改写
 * 2.utils的挂载
 * 3.引入taro-ui 的样式
 */
import Taro from "@tarojs/taro";
import "taro-ui/dist/style/components/modal.scss";
import "taro-ui/dist/style/components/avatar.scss";
import "taro-ui/dist/style/components/toast.scss";
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/list.scss";
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/swipe-action.scss";
import "taro-ui/dist/style/components/fab.scss";
import "taro-ui/dist/style/components/countdown.scss";

/**
 * navigateTo 超过8次之后 强行进行redirectTo 否则会造成页面卡死
 * 
 */
const nav = Taro.navigateTo
Taro.navigateTo = (data) => {
  if (Taro.getCurrentPages().length > 8) {
    return Taro.redirectTo(data)
  }
  return nav(data)
}



const toast = Taro.showToast;
Taro.showToast = (opt:any)=>toast({
    icon:'none',
    ...opt
})