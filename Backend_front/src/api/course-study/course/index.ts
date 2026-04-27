import request from '@/utils/http'

/** 获取课程列表 */
export function getCourseList(params?: { isSvipOnly?: boolean; isFree?: boolean; current?: number; size?: number }) {
  return request.get<{ list: any[]; total: number }>({
    url: '/api/system/course/list',
    params
  })
}

/** 新增课程 */
export function addCourse(data: any) {
  return request.post({
    url: '/api/system/course/add',
    data
  })
}

/** 更新课程 */
export function updateCourse(data: any) {
  return request.put({
    url: '/api/system/course/update',
    data
  })
}

/** 删除课程 */
export function deleteCourse(id: string) {
  return request.del({
    url: `/api/system/course/delete/${id}`
  })
}

/** 修改课程状态 */
export function changeCourseStatus(id: string, status: number) {
  return request.post({
    url: '/api/system/course/status',
    data: { id, status }
  })
}

/** 获取课程章节列表 */
export function getEpisodeList(courseId: string) {
  return request.get<any[]>({
    url: '/api/system/course/episode/list',
    params: { courseId }
  })
}

/** 新增课程章节 */
export function addEpisode(data: any) {
  return request.post({
    url: '/api/system/course/episode/add',
    data
  })
}

/** 更新课程章节 */
export function updateEpisode(data: any) {
  return request.put({
    url: '/api/system/course/episode/update',
    data
  })
}

/** 删除课程章节 */
export function deleteEpisode(id: string) {
  return request.del({
    url: `/api/system/course/episode/delete/${id}`
  })
}

/** 获取章节视频列表 */
export function getVideoList(episodeId: string) {
  return request.get<any[]>({
    url: '/api/system/course/video/list',
    params: { episodeId }
  })
}

/** 新增章节视频 */
export function addVideo(data: any) {
  return request.post({
    url: '/api/system/course/video/add',
    data
  })
}

/** 更新章节视频 */
export function updateVideo(data: any) {
  return request.put({
    url: '/api/system/course/video/update',
    data
  })
}

/** 删除章节视频 */
export function deleteVideo(id: string) {
  return request.del({
    url: `/api/system/course/video/delete/${id}`
  })
}

/** 上传封面 */
export function uploadCourseCover(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<string>({
    url: '/api/system/course/upload-cover',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function uploadCourseVideo(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<string>({
    url: '/api/system/course/upload-video',
    data: formData,
    timeout: 10 * 60 * 1000,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export interface CourseVideoUploadStsPayload {
  scene: 'course-video'
  fileName: string
  contentType: string
}

export interface CourseVideoUploadStsResponse {
  bucket: string
  region: string
  endpoint: string
  secure: boolean
  objectKey: string
  publicUrl: string
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
  partSize: number
  parallel: number
  retryMax: number
  timeoutMillis: number
}

export function getCourseVideoUploadSts(data: CourseVideoUploadStsPayload) {
  return request.post<CourseVideoUploadStsResponse>({
    url: '/api/oss/sts',
    data
  })
}
