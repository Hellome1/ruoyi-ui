import Cookies from 'js-cookie'
import service1 from './request_emr'
import qs from './queryStringify'

const TokenKey = 'Admin-Token'

const testToken = 'access_token'
const dimples = {
  grant_type: 'password',
  username: 'dimples',
  password: '123456',
  role: '系统管理员'
}

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  Cookies.remove(testToken)
  return Cookies.remove(TokenKey)
}

export function getTestToken() {
  return Cookies.get(testToken)
  // return token
}

export function setTestToken(param) {
  var p = param || dimples
  return service1({
    method: 'post',
    url: '/emr/oauth/token',
    data: qs(p)
  })
}

export function getStaticToken() {
  return 'RU1STVM6Z0AyUCFvU2hjM3lsJU5WTTFONGZBJmIwQXZMcjZEWUo='
}