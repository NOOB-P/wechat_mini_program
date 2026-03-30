import { mockSvipCourseList } from '@/mock/course-study/svip-course'

/**
 * 获取 SVIP 课程列表
 */
export async function fetchGetSvipCourseList(params: any) {
  // 模拟请求延迟
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  return {
    code: 200,
    msg: '获取成功',
    data: {
      list: mockSvipCourseList,
      total: mockSvipCourseList.length
    }
  }
}

/**
 * 删除 SVIP 课程
 */
export async function fetchDeleteSvipCourse(id: string) {
  return {
    code: 200,
    msg: '删除成功',
    data: null
  }
}

/**
 * 修改 SVIP 课程状态
 */
export async function fetchChangeSvipCourseStatus(id: string, status: number) {
  return {
    code: 200,
    msg: status === 1 ? '上架成功' : '下架成功',
    data: null
  }
}

/**
 * 新增/更新 SVIP 课程
 */
export async function fetchSaveSvipCourse(data: any) {
  return {
    code: 200,
    msg: data.id ? '更新成功' : '添加成功',
    data: null
  }
}
