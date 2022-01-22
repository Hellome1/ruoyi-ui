import request from '@/utils/request'
import qs from '@/utils/queryStringify'

export function getVitalList(pageNumber, pageSize) {
  let param = {
    pageNumber,
    pageSize
  }
  return request({
    baseURL: '/emr/',
    url: 'vital/dict/list',
    method: 'get',
    params: param
  })
}

export function setVitalList(param) {
  return request({
    baseURL: '/emr/',
    url: 'vital/dict/update',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(param)
  })
}

export function addVitalList(param) {
  return request({
    baseURL: '/emr/',
    url: 'vital/dict',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(param)
  })
}

export function deleteVitalList(param) {
  return request({
    baseURL: '/emr/',
    url: 'vital/dict/delete',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(param)
  })
}

export function switchAppling(param) {
  return request({
    baseURL: '/emr/',
    url: 'vital/dict/abolish',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(param)
  })
}