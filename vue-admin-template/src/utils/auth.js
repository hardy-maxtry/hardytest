import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
    return Cookies.get(TokenKey)
}

export function getToken2() {
  try {
    return JSON.parse(Cookies.get(TokenKey))
  }catch(e){
    return null;
  }
}
export function setToken2(token) {
  return Cookies.set(TokenKey, JSON.stringify(token))
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
