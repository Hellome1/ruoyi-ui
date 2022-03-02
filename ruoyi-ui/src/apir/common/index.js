import request from '@/utils/request'
import qs from '@/utils/queryStringify'

const baseURL = '/emr/'
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded; charset= UTF-8'
}

export function getList(url, param = {}) {
  return request({
    method: 'get',
    baseURL,
    url,
    params: param
  })
}

export function setList(url, param) {
  return request({
    method: 'post',
    baseURL,
    url,
    headers,
    data: qs(param)
  })
}

export function addList(url, param) {
  return request({
    method: 'post',
    baseURL,
    url,
    headers,
    data: qs(param)
  })
}

export function deleteList(url, param) {
  return request({
    method: 'post',
    baseURL,
    url,
    headers,
    data: qs(param)
  })
}

export function switchAppling(url, param) {
  return request({
    method: 'post',
    baseURL,
    url,
    headers,
    data: qs(param)
  })
}