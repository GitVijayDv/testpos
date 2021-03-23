import { parse } from 'qs';
export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}
export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority)); // hard code
  // reload Authorized component

  try {
    if (window.reloadAuthorized) {
      window.reloadAuthorized();
    }
  } catch (error) {
    // do not need do anything
  }

  return authority;
}
const Model = {
  namespace: 'userAndlogin',
  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      
    },

    *getCaptcha({ payload }, { call }) {
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
     
    },
  },
};
export default Model;
