import Cookies from 'js-cookie'
import request from '@/utils/request'
import { service1 } from './request'

const TokenKey = 'Admin-Token'
const testToken = 'access_token'
const developingRole = {//测试角色
  userName:"dimples",
  userCode:"dimples",
  userId:'8384',
  roleCode:"1",
  roleDesc:"系统管理员"
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

// let ajaxData = 'grant_type=password&username=dimples&password=123456&role=%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%98'
let ajaxData = 'grant_type=refresh_token&refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJ7XCJyb2xlSWRcIjpcIjFcIixcInJvbGVOYW1lXCI6XCLns7vnu5_nrqHnkIblkZhcIixcInVzZXJJZFwiOlwiODM4NFwiLFwidXNlckNvZGVcIjpcIjU2ZDNmMDU2LTQwZWUtNDgxOC05MmQ0LWY1ZjlmMjQ5ZDg0N1wiLFwiYWNjb3VudFwiOlwiZGltcGxlc1wiLFwidXNlcm5hbWVcIjpcImRpbXBsZXNcIixcInN0YXR1c1wiOlwiMVwiLFwiY3JlYXRlRGF0ZVwiOlwiMjAyMC0wMy0xMSAxNzowOToxNy4wMDFcIn0iLCJzY29wZSI6WyJFTVJNUyJdLCJhdGkiOiI4MWY1ZWIwMC0yMzFkLTQ0YjktYjg2Yy1hMzgyMzQ1ZGQ4YWQiLCJleHAiOjE2NDMzMzA4MzcsImF1dGhvcml0aWVzIjpbIuezu-e7n-euoeeQhuWRmCJdLCJqdGkiOiI1NDE0MDIxNi01NmExLTQ1NmUtYjU0Ny0yZGIyYmVjNjgxMTEiLCJjbGllbnRfaWQiOiJFTVJNUyJ9.9-geru2G2a6BKugzOSSk1nTXUgxeuznDCgHlCsJQKNY'
export function setTestToken() {
  // return $.ajax(setting)
  
  return service1({
    method: 'post',
    url: '/emr/oauth/token',
    data: 
    // {
    //   grant_type: 'password',
    //   username: 'dimples',
    //   password: '123456',
    //   role: '系统管理员'
    // }
    ajaxData
  })

  function formattingData(dt) {
    let str = '';
    for (let k in dt) {
      if (typeof dt[k] != 'object') {
        if (/\w/.test(dt[k])) {
          console.log(k, JSON.stringify(dt[k]))
          str = str + k + '=' + dt[k] + '&'
        } else {
          str = str + k + '='
          for (let i = 0; i < dt[k].length; i++) {
            str += String.fromCharCode(dt[k]);
          }
        }
      }
    }
    str = str.substring(0, str.length - 1);
    return str
  }
}

export function getStaticToken() {
  return 'RU1STVM6Z0AyUCFvU2hjM3lsJU5WTTFONGZBJmIwQXZMcjZEWUo='
}

let setting = {
  "url": "http://192.178.61.87:8002/emr/oauth/token",
  "type": "POST",
  "statusCode": {},
  "dataType": "json",
  "data": {
      "grant_type": "password",
      "username": "dimples",
      "password": "123456",
      "role": "系统管理员",
      "params": {}
  },
  "async": false,
  "headers": {
      "Authorization": "Basic RU1STVM6Z0AyUCFvU2hjM3lsJU5WTTFONGZBJmIwQXZMcjZEWUo="
  }
}