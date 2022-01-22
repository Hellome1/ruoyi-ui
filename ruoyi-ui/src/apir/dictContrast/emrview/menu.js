import request from '@/utils/request'
import qs from '@/utils/queryStringify'

export function getMenuList(pageNumber, pageSize) {
  let param = {
    pageNumber,
    pageSize
  }
  return request({
    baseURL: '/emr/',
    url: 'menu/dict/contrast/list',
    method: 'get',
    params: param
  })
}

export function setMenuList(param) {
  return request({
    baseURL: '/emr/',
    url: 'menu/dict/contrast/update',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(param)
  })
}

export function addMenuList(param) {
  return request({
    baseURL: '/emr/',
    url: 'menu/dict/contrast',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: qs(param)
  })
}

export function getCorrespondingMenu(param) {
  return request({
    baseURL: '/emr/',
    url: 'menu/list',
    method: 'get',
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    // },
    params: param
  })
}