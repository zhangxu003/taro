import Taro, { Component, Config } from "@tarojs/taro";
import "@tarojs/async-await";
import { Provider } from '@tarojs/redux'
// import "./utils/request";
import Index from "./pages/Index/index";
import dva from './utils/dva'
import models from './models'
import './global';
import './app.less'
// import { globalData } from "./utils/common";

const dvaApp = dva.createApp({
  initialState: {},
  models: models,
});

const store = dvaApp.getStore();

class App extends Component {
  // 抛出全局
  g_app=dvaApp.getStore()

  config: Config = {
    pages: [
      'pages/Index/index',
      'pages/Parent/Home/index',
      'pages/Parent/AddStudent/index',
    ],
    debug:false,
    window: {
      navigationBarBackgroundColor: '#03C46B',
      // navigationBarTitleText: '高耘小程序',
      navigationBarTextStyle: 'white',
      backgroundColor: '#ffffff',
    }
  }

  /**
   *
   *  1.小程序打开的参数 globalData.extraData.xx
   *  2.从二维码进入的参数 globalData.extraData.xx
   *  3.获取小程序的设备信息 globalData.systemInfo
   * @memberof App
   */
  // async componentDidMount() {
  //   const {dispatch} = this.props;
  //   if(dispatch){
  //     const sys = await Taro.getSystemInfo();
  //     console.log(sys);
  //   }
  //   // // 获取参数
  //   // const referrerInfo = this.$router.params.referrerInfo;
  //   // const query = this.$router.params.query;
  //   // !globalData.extraData && (globalData.extraData = {});
  //   // if (referrerInfo && referrerInfo.extraData) {
  //   //   globalData.extraData = referrerInfo.extraData;
  //   // }
  //   // if (query) {
  //   //   globalData.extraData = {
  //   //     ...globalData.extraData,
  //   //     ...query
  //   //   };
  //   // }

  //   // // 获取设备信息
  //   // const sys = await Taro.getSystemInfo();
  //   // sys && (globalData.systemInfo = sys);
  // }
  // async componentDidMount(){
  //   // 系统初始化
  //   // 1、第一步微信登录
  //   await this.g_app.dispatch({type:'global/login'})
  //   // 2、获取设备信息
  //   await this.g_app.dispatch({type:'global/getClientInfo'})
  //   // 3、获取微信用户信息
  //   const hasRole = await this.g_app.dispatch({type:'global/getUserInfo'})
  //   // 判断是否允许了微信用户消息
  //   if(!hasRole){
  //     // 弹出框
  //     // Taro.showModal({
  //     //   title: '',
  //     //   content: '请授权您的微信账号登录高耘小程序',
  //     //   showCancel:false,
  //     //   confirmText:'授权登录'
  //     // }).then(async () => {
  //     //   // const tt = await Taro.authorize({scope:"scope.userInfo"});
  //     //   // console.log(tt);
  //     // })
  //   }
  // }

  componentDidShow() { }
  

  componentDidHide() { }

  componentDidCatchError() { }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    console.log('===page===: app.tsx');
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))