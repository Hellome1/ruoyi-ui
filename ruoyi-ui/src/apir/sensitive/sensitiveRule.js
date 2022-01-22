import request from '@/utils/request'

// 测试获取信息
export function getRule(pageNum, pageSize) {
  const data = {
    pageNum,
    pageSize
  }
  return request({
    baseURL: '/emr/',
    url: 'sensitive/list/rule',
    method: 'get',
    params: data
  })
}
