import request from '@/utils/request'

export const openSchoolVipApi = (data: { months: number }) => {
  return request({
    url: '/api/app/vip/school/open',
    method: 'POST',
    data
  })
}
