import request from '@/utils/request'
import axios from '@/utils/ajax';
import urls from '@/config/urls';


export function login(username, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function login2(username, password) {
  let postData = {
    userName: username,
    password : password
  }
  return axios.post(urls.logon_signin, postData)
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function getInfo2(token, id) {
  // return request({
  //   url: '/user/info',
  //   method: 'get',
  //   params: { token }
  // })
  return axios.get(`${urls.user_detail}${id}`)
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function logout2(token) {
   
  let params = {
                  params : {
                    token :token
                  }
              };
  return axios.get(urls.logon_signout,params);
}