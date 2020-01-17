import { ComponentClass } from "react";
import { AnyAction } from 'redux';
import { AtInput, AtButton, AtCountdown , AtModal, AtModalContent, AtModalAction } from 'taro-ui'
import Taro, { Component, Config } from "@tarojs/taro";
import { View, Button } from "@tarojs/components";
import { connect } from "@tarojs/redux";
import classNames from 'classnames'
import { isPhoneAvailable } from '@/utils/utils';
import Countdown from '../Components/Countdown/index';
import styles from "./index.modules.less";

type PageStateProps = {
  verificationCodeInfo:any;
  dispatch?<K = any>(action: AnyAction): K;
};

type PageOwnProps = {
    getCodeLoading: boolean;
    identityInfo: any;
    PARENT_TYPE: any;
    TASK_TYPE: any;
    addLoading: boolean;
    studentInfo: any;
};

type PageState = {};

type IProps = PageStateProps & PageOwnProps;

interface Index {
  props: IProps;
}

@connect(({ global,loading, parent }) => {
  const {verificationCodeInfo = undefined, PARENT_TYPE=[] } = global;
  const { identityInfo,studentInfo = [] } = parent;
  return {
    PARENT_TYPE,
    verificationCodeInfo,
    identityInfo,
    studentInfo,
    getCodeLoading:loading.effects['global/getVerificationCode'],
    addLoading:loading.effects['parent/addStudent']
  }
})
class Index extends Component {

  state = {
    phone: '', // 手机号
    code: '', // 短信验证码
    parentCode: 'MOTHER', // 和孩子的关系
    showModal: false, // 确认弹窗
    isCountDown: false,
  }
  config: Config = {
    navigationBarTitleText: "添加孩子",
    navigationBarBackgroundColor: "#ffffff",
    navigationBarTextStyle: 'black',
  };

  componentWillUnmount() {
    const { dispatch } = this.props;
      if (dispatch) {
        // 清除获取的验证码id
        dispatch({
            type: "global/updateState",
            payload: { verificationCodeInfo: undefined }
        });
      }
  }

  // 手机号输入框变更
  handleChange = (value) => {
    this.setState({
      phone: value
    })
  }

  // 验证码输入框变更
  handleCodeChange = (value) => {
    this.setState({
      code: value
    })
  }

   // 获取验证码
   getCode = () => {
      const { phone } = this.state;
      if (!phone) {
        Taro.showToast({
            title: '手机号为空',
        })
      } else if (!isPhoneAvailable(phone)) {
        Taro.showToast({
            title: '手机号码格式有误',
        })
      } else {
        // 首先检测身份是否注册了我们系统
        this.checkIdentity();
      }
  }

  // 检测身份
  checkIdentity = () => {
    const { dispatch } = this.props;
    const { phone } = this.state;
    if (dispatch) {
        dispatch({
            type: "parent/checkIdentity",
            payload: { mobile: phone }
        }).then(() => {
          const { identityInfo } = this.props;
          // 判断是否有学生身份
          const obj = identityInfo.find((item) => item.identityId === '2');
          if (!obj) {
            Taro.showToast({
              title: '手机号码不存在 请输入孩子的注册手机号',
            })
          } else {
            // 获取验证码
            this.getVerificationCode();
            // 根据学生accountId获取学生信息
            this.getStudentInfo();
          }
        });
    }
  }

  // 根据学生accoutId获取学生绑定信息
  getStudentInfo = () => {
    const { dispatch,identityInfo } = this.props;
    const obj = identityInfo.find((item) => item.identityId === '2');
      if (dispatch) {
        dispatch({
            type: "parent/getStudentInfo",
            payload: { accountId: obj.accountId }
        });
      }
  }

  // 获取验证码
  getVerificationCode = () => {
      const { dispatch } = this.props;
      const { phone } = this.state;
      if (dispatch) {
        dispatch({
            type: "global/getVerificationCode",
            payload: { telephone: phone }
        }).then(() => {
          this.setState({
            isCountDown: true
          })
        });
      }
  }

  // 验证验证码是否正确
  validaCode = () => {
      const { dispatch,verificationCodeInfo } = this.props;
      const { phone,code } = this.state;
      if (dispatch) {
        dispatch({
            type: "global/validateCode",
            payload: { 
              mobile: phone,
              validateCode: code,
              validateCodeId:verificationCodeInfo.data
             },
            callback: (res) => {
              if (res && res.responseCode === '200') {
                // 验证码正确打开确认弹窗
                this.setState({
                  showModal: true
                })

              } else {
                Taro.showToast({
                  title: '短信验证码不正确',
                })
              }
            }
        });
      }
  }

  // 选择和孩子的关系
  handleSelect = (item) => {
    this.setState({
      parentCode: item.code
    })
  }

  // 取消操作
  handleCancel = () => {
    this.setState({
      showModal: false
    })
  }

  // 确认操作
  handleOk = () => {
    const { dispatch,identityInfo } = this.props;
    const { parentCode } = this.state;
    const accountId = Taro.getStorageSync('userId');
    const openId = Taro.getStorageSync('openid');
    const obj = identityInfo.find((item) => item.identityId === '2');
      if (dispatch) {
        dispatch({
            type: "parent/addStudent",
            payload: { 
              accountId, // 家长accountId
              openId,
              parentCode,
              studentAccountId: obj && obj.accountId
            },
            callback: (res) => {
              if (res.responseCode === '200') {
                Taro.navigateBack({ delta: 1 })
              } else if (res.responseCode === '460') {
                Taro.showToast({
                  title: '该孩子已添加',
                })
              } else {
                Taro.showToast({
                  title: '添加失败',
                })
              }
            }
        });
      }
  }

  // 添加孩子
  add = () => {
   
    const { verificationCodeInfo } = this.props;
    if (!verificationCodeInfo) {
      Taro.showToast({
        title: '请输入孩子的注册手机号获取验证码',
      })
      return;
    }
    // 首先验证手机端短信是否正确
    this.validaCode();

  }

  // 倒计时结束
  handleTimeUp = () => {
    this.setState({
      isCountDown: false
    })
  }

  render() {
    const { 
      verificationCodeInfo,
      getCodeLoading, 
      PARENT_TYPE,
      addLoading,
      studentInfo
    } = this.props;
    const { phone, code, parentCode,showModal,isCountDown } = this.state;
    const addBtnDisabled = phone && code;
    return (
      <View className={styles.addStudent}>
        <AtInput 
          className={styles.phoneInput}
          name='phone' 
          type='phone' 
          placeholder='请输入孩子的注册手机号' 
          value={phone} 
          maxLength={11}
          onChange={this.handleChange} 
        />
        <View className={styles.codeView}>
            <AtInput 
                className={styles.codeInput}
                name='phone' 
                type='number' 
                
                placeholder='请输入验证码' 
                value={code} 
                onChange={this.handleCodeChange} 
            />
            {/* 60秒倒计时 */}
            {
              isCountDown && 
              <Countdown
                className={styles.countDown}
                seconds={60}
                onTimeUp={this.handleTimeUp}
              />
            }
            {
              !isCountDown && 
              <AtButton 
                circle 
                type='primary' 
                onClick={this.getCode} 
                loading={getCodeLoading}
              >
                {verificationCodeInfo ? '重新发送' : '获取验证码'}
              </AtButton>
            }
             
            
        </View>
        <View className={styles.addView}>
            <AtButton circle type='primary' className={addBtnDisabled ? styles.addBtn : styles.addBtnDisabled} onClick={this.add} disabled={!addBtnDisabled}>添加孩子</AtButton>
        </View>
        
        {/* 确定弹窗 */}
        <AtModal
            isOpened={showModal}
            // isOpened={true}
            className={styles.modal}
            closeOnClickOverlay={false}
          >
            <AtModalContent>
              <View className={styles.title}>是否确认添加孩子？</View>
              {/* 学生信息 */}
              <View className={styles.studentInfo}>
                {/* 已注册账号暂未绑定班级 */}
                {
                  studentInfo.length === 0 && 
                  <View>
                    <View className={styles.studentName}>{phone}</View>
                    <View className={styles.des}>请登录高耘教育云平台绑定班级</View>
                  </View>
                }
                {/* 已绑定学校 */}
                {
                  studentInfo.length > 0 && 
                  <View>
                    <View className={styles.studentName} style={{marginBottom: 0}}>{studentInfo[0].name}</View>
                    {
                      studentInfo.map((stu) => {
                        return (
                          <View key={stu.studentId} className={styles.studentItem}>
                             <View className={styles.campusName}>{stu.campusName}</View>
                              <View className={styles.className}>{stu.classList[0].className}</View>
                          </View>
                        )
                      })
                    }
                   
                  </View>
                }
              </View>
              <View className={styles.line} />
              {/* 和孩子的关系 */}
              <View>
                <View className={styles.tip}>请选择您与孩子的关系</View>
                <View className={styles.itemView}>
                  {
                    PARENT_TYPE.map((item) => {
                      return (
                        <View className={classNames(styles.item, item.code === parentCode ? styles.checked : null)} key={item.code} onClick={() => this.handleSelect(item)}>
                          {`我是${item.value}`}
                        </View>
                      )
                    })
                  }
                </View>
              </View>
            </AtModalContent>
            <AtModalAction>
              <Button className={styles.cancelBtn} onClick={this.handleCancel}>
                取消
              </Button>
              <Button className={styles.okBtn} onClick={this.handleOk} loading={addLoading}>
                确认
              </Button>
            </AtModalAction>
          </AtModal>
      </View>
    );
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>;
