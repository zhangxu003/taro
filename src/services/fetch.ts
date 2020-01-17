
import Api  from '@/utils/request';


export const login = (params)=>{
  return Api.loginUrl(params);
}

export const getCode = (params)=>{
  return Api.getCodeUrl(params,'POST');
}

export const validateCode = (params)=>{
  return Api.validateCode(params,'POST');
}

export const queryDictionary = (params)=>{
  return Api.queryDictionary({codeTypeList:params});
}


