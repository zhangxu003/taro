import Taro from "@tarojs/taro";
import { login,getCode,validateCode, queryDictionary } from '@/services/fetch';

export interface userInfo{
  avatarUrl?:string; // 头像
  city?:string; // 所在城市
  country?:string; // 所在国家
  nickName?:string; // 姓名
  province?:string; // 省份
  gender?:number; // 性别
  language?:string; // 主要语言
}

export type CodeType = object & {
  id: string;
  code: string;
  typeCode: string;
  value: string;
  parentCode?: string;
  addressDetails?: string;
};


// 需要统一获取的 字典列表
// 额外补充 code， 如下模式即可
const codeList = {
  PARENT_TYPE: [], // 家长和学生关系
};

/**
 * 全局相关的modal
 */
export default {
  namespace: "global",
  state: {
    hasReady: false, // 是否已经初始化完成
    PARENT_TYPE: [], // 家长和学生关系
    userInfo: undefined, // 用户信息
    authSetting: {}, // 用户授权列表
    clientInfo: {}, // 设备信息
    verificationCodeInfo: undefined, // 验证码信息
    hasLoad: false, // 字典库是否已经加载过了
    ...codeList,
  },

  effects: {
    // 初始化
    *init(_, { all, put }) {
      // 1、小程序登录，后台登录
      yield put.resolve({ type: "login" });
      yield all([
        // 2、获取授权信息，和用户信息
        put.resolve({ type: "getUserInfo" }),
        // 3、获取字典信息
        put.resolve({ type: "getDictionary" }),
        // 4、获取设备信息
        put.resolve({ type: "getClientInfo" })
      ]);
      yield put({
        type:'updateState',
        payload:{hasReady:true}
      })
    },

    // 小程序登录
    *login(_, { call, put }) {
      // 先判断缓存中是否有token
      const token = Taro.getStorageSync("token");
      // console.log("后台返回token", !token);
      
      if( !token ){
        const code = yield call(Taro.login);
        const params = {
          code: code.code, // 微信获取的code
          identityCode:"ID_PARENT", // 登录账号身份
        }
        // 获取token
        const authRes = yield call(login,params);
        if (authRes && authRes.responseCode === "200") {
          // 存储token和userId
          Taro.setStorage({ key: 'token', data: authRes.data.access_token });
          Taro.setStorage({ key: 'userId', data: authRes.data.userId });
          Taro.setStorage({ key: 'openid', data: authRes.data.openid });
          Taro.setStorage({ key: 'vbNo', data: authRes.data.vbNo })
          
        } else {
          Taro.showToast({
            title: authRes.data,
          })
          throw new Error('登录失败!');
        }
      }
    },

    // 获取字典信息
    *getDictionary(_, { call, put, select }) {
      const { hasLoad } = yield select((state) => state.global);
      if (hasLoad) return;

      let responseData: CodeType[];
      try {
        // 此接口不需要单独的报错处理
        const res = yield call(queryDictionary, Object.keys(codeList).join(','));
        responseData = res.data;
        
      } catch (err) {
        return;
      }

      console.log('responseData:',responseData);
      // 遍历数据生成key-value形式
      const result = {};
      responseData.forEach(item => {
        const { id, code, typeCode, value, parentCode, addressDetails } = item;
        const obj = { id, code, typeCode, value, parentCode, addressDetails };
        if (item.typeCode in result) {
          result[item.typeCode].push(obj);
        } else {
          result[item.typeCode] = [obj];
        }
      });
      yield put({
        type: 'updateState',
        payload: {
          ...result,
          hasLoad: true,
        },
      });
    },

    // 获取微信用户信息
    *getUserInfo(_, { call, put }) {
      const { authSetting } = yield call(Taro.getSetting);
      console.log("授权信息", authSetting);
      yield put({
        type: "updateState",
        payload: { authSetting }
      });
      // 判断用户是否已经授权了小程序
      if (authSetting["scope.userInfo"]) {
        // 如果已经授权，获取用户信息
        const { userInfo } = yield call(Taro.getUserInfo);
        console.log("用户信息", userInfo);
        yield put({
          type: "updateState",
          payload: { userInfo }
        });
        return true;
      }
      return false;
    },

    // 获取设备信息
    *getClientInfo(_, { call, put }) {
      const clientInfo = yield call(Taro.getSystemInfo);
      console.log("设备信息", clientInfo);
      yield put({
        type: "updateState",
        payload: {
          clientInfo
        }
      });
    },

    // 获取手机验证码
    *getVerificationCode({payload}, { call, put }) {
      const verificationCodeInfo = yield call(getCode,payload);
      yield put({
        type: "updateState",
        payload: {
          verificationCodeInfo
        }
      });
    },

    // 验证短信验证码
    *validateCode({payload,callback}, { call }) {
      const res = yield call(validateCode,payload);
      if (callback) {
        callback(res);
      }
    },
  },

  reducers: {
    // 更新基础数据
    updateState(state, { payload }) {
      return { ...state, ...payload };
    }
  },

  subscriptions:{
    // 初始化
    init({dispatch}){
      dispatch({  type:'init' })
    }
  }
};
