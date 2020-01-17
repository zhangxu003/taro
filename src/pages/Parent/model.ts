import Taro from "@tarojs/taro";
import { getBingStudents,checkIdentity,getStudentInfo,addStudent,handleUnbind } from './service';

/**
 * 家长的主modal
 */
export default {
  namespace: 'parent',
  state: {
    studentList : [], // 已绑学生
    identityInfo : [], // 账号的身份信息
    studentInfo : [], // 学生信息
  },

  effects: {
    // 获取已绑学生
    * getStudentList({payload}, { call, put }) {
      const res = yield call(getBingStudents,payload);
      yield put({
        type: "updateState",
        payload: {
          studentList: res.data
        }
      });
    },
    // 检查身份
    * checkIdentity({payload}, { call, put }) {
      const res = yield call(checkIdentity,payload);
      yield put({
        type: "updateState",
        payload: {
          identityInfo: res.data
        }
      });
    },

    // 获取学生信息
    * getStudentInfo({payload}, { call, put }) {
      const res = yield call(getStudentInfo,payload);
      yield put({
        type: "updateState",
        payload: {
          studentInfo: res.data
        }
      });
    },

    // 添加学生
    * addStudent({payload,callback}, { call, put }) {
      const res = yield call(addStudent,payload);
      if (callback) {
        callback(res);
      }
      // 添加成功后重新获取列表
      if (res&&res.responseCode === '200') {
        const accountId = Taro.getStorageSync('userId');
        yield put({ type: "getStudentList", payload:{accountId} });
      }
    },

    // 解绑学生
    * handleUnbind({payload,callback}, { call, put }) {
      const res = yield call(handleUnbind,payload);
      if (callback) {
        callback(res);
      }
    }
  },

  reducers: {
    // 更新基础数据
    updateState(state, { payload }) {
      return { ...state, ...payload }
    }
  }

}