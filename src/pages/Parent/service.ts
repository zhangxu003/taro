// 家长端统一的请求接口

import Api  from '@/utils/request';

// 获取已绑定学生列表
export const getBingStudents = (params)=>{
  return Api.getBingStudents(params);
}

// AUTH-306：检查手机注册了几个身份
export const checkIdentity = (params)=>{
  return Api.checkIdentity(params);
}


// CAMPUS-109：查询所有已经绑定的学生信息
export const getStudentInfo = (params)=>{
  return Api.getStudentInfo(params);
}

// CAMPUS-031：微信接口-确认添加
export const addStudent = (params)=>{
  return Api.addStudent(params,'POST');
}

// CAMPUS-031：微信接口-确认添加
export const handleUnbind = (params)=>{
  return Api.handleUnbind('','PUT',params);
}

