import request from '@/utils/request'
import qs from '@/utils/queryStringify'

export function getDictList(pageNum, pageSize) {
  var param = {
    pageNum,
    pageSize
  }
  return request({
    baseURL: '/emr/',
    url: 'dict/contrast',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    params: param
  })
}

export function addDictList(param) {
  return request({
    baseURL: '/emr/',
    url: 'dict/contrast',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(param)
  })
}

export function setDictList(param) {
  return request({
    baseURL: '/emr/',
    url: 'dict/contrast/update',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset: UTF-8'
    },
    data: qs(param)
  })
}

export function deleteDictList(param) {
  return request({
    baseURL: '/emr/',
    url: 'dict/contrast/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset= UTF-8'
    },
    data: qs(param)
  })
}