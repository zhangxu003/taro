import { ComponentClass } from "react";
import { AnyAction } from 'redux';
import { AtDivider, AtButton, AtSwipeAction,AtFab,AtModal, AtModalContent, AtModalAction } from 'taro-ui'
import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, Image, Button } from "@tarojs/components";
import { connect } from "@tarojs/redux";
import logo from '../../../assets/parent/gaoyun_icon.png';
import styles from "./index.modules.less";

type PageStateProps = {
  userInfo:any;
  dispatch?<K = any>(action: AnyAction): K;
};

type PageOwnProps = {
  studentList: any;
  loading: boolean;
  unbindLoading: boolean;
};

type PageState = {};

type IProps = PageStateProps & PageOwnProps;

interface Index {
  props: IProps;
}

@connect(({ global,parent,loading }) => {
  const {userInfo={}} = global;
  const {studentList = []} = parent;
  return {
    userInfo,
    studentList,
    loading: loading.effects['parent/getStudentList'],
    unbindLoading: loading.effects['parent/handleUnbind'],
  }
})
class Index extends Component {
  state = {
    currentItem: null,
    showDeleteModal: false
  }
  config: Config = {
    // navigationBarTitleText: "家长首页",
    // navigationBarBackgroundColor: "#03C46B",
  };

  componentDidMount() {
    this.getList();
  }

  // 获取绑定学生列表
  getList = () => {
    const { dispatch } = this.props;
    const accountId = Taro.getStorageSync('userId');
    if (dispatch) {
      dispatch({
        type: "parent/getStudentList",
        payload: { accountId }
      });
    }
  }

  addStudent = () => {
    Taro.navigateTo({url: '/pages/Parent/AddStudent/index'})
  }

  // 解绑
  handleUnbind = (item) => {
    console.log('---handleUnbing--:',item)
    
    const { id } = item;
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: "parent/handleUnbind",
        payload: { id },
        callback:(res) => {
          this.setState({
            showDeleteModal: false
          })
          if (res && res.responseCode === '200') {
            this.getList();
          } else {
            Taro.showToast({
              title: '解绑失败',
            })
          }
        }
      });
    }
  }

  // 取消解绑
  handleCancel = () => {
    this.setState({
      currentItem: null,
      showDeleteModal: false
    })
  }

  // 确认解绑
  handleConfirm = () => {
    const { currentItem } = this.state;
    this.handleUnbind(currentItem);
  }

  render() {
    const { showDeleteModal } = this.state;
    const { userInfo,studentList,loading,unbindLoading } = this.props;
    const { avatarUrl, nickName }= userInfo;
    const vbNo = Taro.getStorageSync('vbNo');
    return (
      <View className={styles.index}>
        {/* 账号信息 */}
        <View className={styles.top}>
          <View>
            <Image
              className={styles.avatar}
              src={avatarUrl}
            />
          </View>
          <View style={{marginTop:'10px'}}>
            <Text className={styles.userName}>{nickName}</Text>
          </View>
          <View>
            <View className={styles.gaoAccount}>
              <Image
                className={styles.logo}
                src={logo}
              />
              <AtDivider content='|' fontColor="#FFE7AE" fontSize="22px" customStyle={{padding: '0 4px'}} />
              <Text className={styles.txt}>{vbNo}</Text>
            </View>
          </View>
        </View>

        {/* 关联学生 */}
        {
          !loading && studentList.length === 0 && 
          <View className={styles.addStudentView}>
            <View className={styles.tip}>
              <Text>快去见证Ta的成长吧</Text>
            </View>
            <AtButton circle type='primary' className={styles.addBtn} onClick={this.addStudent}>添加孩子</AtButton>
          </View>
        }
        

        {/* 已绑定学生 */}
        {
          !loading && studentList.length > 0 && 
          <View className={styles.list}>
            {
              studentList.map((item) => {
                return (
                  <AtSwipeAction 
                    key={item.id}
                    className={styles.swipe}
                    options={[
                      {
                        text: '解绑',
                        className: styles.option,
                      }
                    ]}
                    onClick={() => {
                      this.setState({
                        currentItem: item,
                        showDeleteModal: true
                      })
                    }}
                  >
                    <View className={styles.cell}>
                      <View className={styles.name}>{item.studentName ? item.studentName : item.mobile}</View>
                      {/* 未绑定学校班级 */}
                      {
                        item.campusList.length === 0 && 
                        <View className={styles.des}>{item.studentName ? '请登录高耘教育云平台绑定班级' : '请登录高耘教育云平台完善孩子信息并绑定班级'}</View>
                      }
                      {/* 已绑定校区 */}
                      {
                        item.campusList.length > 0 && 
                        <View>
                          {
                            item.campusList.map((campus) => {
                              return (
                                <View className={styles.campusItem} key={campus.campusId}>
                                  <View className={styles.campusName}>{campus.campusName}</View>
                                  <View className={styles.naturalClassName}>{campus.naturalClassName}</View>
                                </View>
                              )
                            })
                          }
                        </View>
                      }
                    </View>
                  </AtSwipeAction>
                )
              })
            }
          </View>
        }
        
        {/* 添加的浮动按钮 */}
        {
          !loading && studentList.length > 0 && 
          <View className={styles.addFab}>
            <AtFab onClick={this.addStudent}>
              <Text className='at-fab__icon at-icon at-icon-add'></Text>
            </AtFab>
          </View>
        }

        {/* 删除弹窗 */}
        <AtModal 
          isOpened={showDeleteModal} 
          closeOnClickOverlay={false} 
          className={styles.deleteModal}
        >
          
          <AtModalContent>
            <View className={styles.infoTxt}>解绑后，您将不能关注Ta的学习进展，是否确认解绑？</View>
          </AtModalContent>
          <AtModalAction>
            <Button className={styles.cancelBtn} onClick={this.handleCancel}>取消</Button>
            <Button className={styles.okBtn} onClick={this.handleConfirm} loading={unbindLoading}>确定</Button> 
          </AtModalAction>
        </AtModal>
        
      </View>
    );
  }
}

export default Index as ComponentClass<PageOwnProps, PageState>;
