import request from '@/utils/request'
import qs from '@/utils/queryStringify'

export function getSensitiveList(pageNumber, pageSize) {
  let data = {
    pageNumber,
    pageSize
  }
  return request({
    baseURL: '/emr/',
    methods: 'get',
    url: 'sensitive/list/info',
    params: data
  })
}

export function setSensitiveList(postData) {
  return request({
    baseURL: '/emr/',
    method: 'post',
    url: 'sensitive/update',
    headers: {
      'content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(postData)
  })
}

export function getDict() {
  return request({
    baseURL: '/emr/',
    method: 'get',
    url: 'sensitive/dict'
  })
}

export function addSensitiveRule(postData) {
  return request({
    baseURL: '/emr/',
    method: 'post',
    url: 'sensitive',
    headers: {
      'content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(postData)
  })
}

export function deleteSensitiveRule(postData) {
  return request({
    baseURL: '/emr/',
    method: 'post',
    url: 'sensitive/delete',
    headers: {
      'content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(postData)
  })
}