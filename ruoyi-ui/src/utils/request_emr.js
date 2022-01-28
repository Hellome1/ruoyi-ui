import axios from 'axios'
import { Notification,  Message } from 'element-ui'
import { getStaticToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'

// 创建axios实例
const service1 = axios.create({
  // baseURL: 'http://192.178.61.87:8002',
  baseURL: 'http://192.178.61.172:8001', // 测试库
  timeout: 3000
})

service1.interceptors.request.use(config => {
  // console.log(config);
  config.headers['Authorization'] = 'Basic ' + getStaticToken()
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
  return config
})

service1.interceptors.response.use(res => {
   // 未设置状态码则默认成功状态
   const code = res.data.code || 200;
   // 获取错误信息
   const msg = errorCode[code] || res.data.msg || errorCode['default']
   // 二进制数据则直接返回
   if(res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer'){
     return res.data
   }
   if (code === 401) {
     // 401返回代码
     return Promise.reject(code)
   } else if (code === 500) {
     Message({
       message: msg,
       type: 'error'
     })
     return Promise.reject(new Error(msg))
   } else if(code === 400) {
     Notification.warning({
       title: msg
     })
     return Promise.reject(res.data)
   } else if (code !== 200) {
     Notification.error({
       title: msg
     })
     return Promise.reject('error')
   } else {
     return res.data
   }
 },
 error => {
   console.log('err' + error)
   let { message } = error;
   if (message == "Network Error") {
     message = "后端接口连接异常";
   }
   else if (message.includes("timeout")) {
     message = "系统接口请求超时";
   }
   else if (message.includes("Request failed with status code")) {
     message = "系统接口" + message.substr(message.length - 3) + "异常";
   }
   Message({
     message: message,
     type: 'error',
     duration: 5 * 1000
   })
   return Promise.reject(error)
  }
)

export default service1
