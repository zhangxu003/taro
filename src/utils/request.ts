import Taro, { Component } from '@tarojs/taro'
import stringify from 'qs/lib/stringify';
import {
  conmomPrams,
  requestConfig
} from '../config/api'


// 请求域名
const MAINHOST = process.env.PREFIX_URL;

// import { createLogger } from './logger'

declare type Methods = "GET" | "OPTIONS" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT";
declare type Headers = { [key: string]: string };
declare type Datas = { method: Methods;[key: string]: any; };
interface Options {
  url: string;
  host?: string;
  method?: Methods;
  data?: Datas;
  header?: Headers;
}

export class Request {
  //登陆的promise
  static loginReadyPromise: Promise<any> = Promise.resolve()
  // 正在登陆
  static isLogining: boolean = false
  // 导出的api对象
  static apiLists: { [key: string]: () => any; } = {}
  // token
  static token: string = ''

  // constructor(setting) {

  // }
  /**
   * @static 处理options
   * @param {Options | string} opts
   * @param {Datas} data
   * @returns {Options}
   * @memberof Request
   */
  static conbineOptions(opts, data: Datas, method: Methods,params:any): Options {
    
    typeof opts === 'string' && (opts = { url: opts });
    const returnMethod = opts.method || method || 'GET';
    let returenData = { ...conmomPrams, ...opts.data, ...data };
    let returnUrl = `${opts.host || MAINHOST}${opts.url}`;
    
    if( method === 'GET' ){
      returenData = {...returenData,...params}
    }else{
      const str = stringify(params, { addQueryPrefix: true });
      returnUrl=returnUrl+str;
    }
    return {
      data: returenData,
      method: returnMethod,
      url: returnUrl
    }
  }

  static getToken() {
    !this.token && (this.token = Taro.getStorageSync('token'))
    return this.token
  }

  /**
   * 
   * @static request请求 基于 Taro.request
   * @param {Options} opts 
   */
  static async request(opts: Options) {
    // token不存在
    // if (!this.getToken()) { await this.login() }

    // token存在
    // let options = Object.assign(opts, { header: { 'token': this.getToken() } })

    //  Taro.request 请求
    const res = await Taro.request(opts)

    // 是否mock
    // if (ISMOCK) { return res.data }

    // console.log('-------res:',res);
    // console.log('-------opts:',opts);
    // 登陆失效 
    if (res.data.responseCode === "402") { 
      await this.login(); 
      const token = Taro.getStorageSync('token');
      return this.request({...opts,header:{Authorization: `bearer ${token}`}});
    }

    // 请求成功
    // if (res.data && res.data.code === 0 || res.data.succ === 0) { return res.data }
    if (res.data) { return res.data }

    // 请求错误
    const d = { ...res.data, err: (res.data && res.data.msg) || `网络错误～` }
    Taro.showToast({
        title: d.err,
    })
    throw new Error(d.err)
  }

  /**
   * 
   * @static 登陆
   * @returns  promise 
   * @memberof Request
   */
  static login() {
    if (!this.isLogining) { this.loginReadyPromise = this.onLogining() }
    return this.loginReadyPromise
  }

  /**
   *
   * @static 登陆的具体方法
   * @returns
   * @memberof Request
   */
  static onLogining() {
    this.isLogining = true
    return new Promise(async (resolve, reject) => {
      // 获取code
      const { code } = await Taro.login()

      // 请求登录
      const loginParams = {
        code, // 微信获取的code
        identityCode:"ID_PARENT", // 登录账号身份
      }
      const { data } = await Taro.request({
        url: `${MAINHOST}${requestConfig.loginUrl}`,
        data: loginParams
      })

      if (data.responseCode !== "200" || !data.data || !data.data.access_token) {
        reject()
        return
      }

      console.log('重置token')
      // Taro.setStorageSync('token', data.data.access_token)
      Taro.setStorage({ key: 'token', data: data.data.access_token });
      Taro.setStorage({ key: 'userId', data: data.data.userId });
      Taro.setStorage({ key: 'openid', data: data.data.openid });
      this.isLogining = false
      resolve()
    })
  }

  /**
   *
   * @static  创建请求函数
   * @param {(Options | string)} opts
   * @returns
   * @memberof Request
   */
  static creatRequests(opts: Options | string): () => {} {
    return async (data = {}, method: Methods = "GET", params = {}) => {
      const _opts = this.conbineOptions(opts, data, method,params)
      const token = Taro.getStorageSync('token')
      // header中添加token
      const requestParams = token ? {..._opts,header:{Authorization: `bearer ${token}`}} : {..._opts};
      const res = await this.request(requestParams)
      // createLogger({ title: 'request', req: _opts, res: res })
      return res
    }
  }

  /**
   *
   * @static 抛出整个项目的api方法
   * @returns
   * @memberof Request
   */
  static getApiList(requestConfig) {
    if (!Object.keys(requestConfig).length) return {}

    Object.keys(requestConfig).forEach((key) => {
      this.apiLists[key] = this.creatRequests(requestConfig[key])
    })

    return this.apiLists
  }
}

// 导出
const Api = Request.getApiList(requestConfig)
Component.prototype.$api = Api
export default Api as any
