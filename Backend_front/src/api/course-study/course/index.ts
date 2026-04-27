import request from '@/utils/http'

export interface CourseListParams {
  current?: number
  size?: number
  type?: string
  isSvipOnly?: boolean
  isFree?: boolean
}

export function getCourseList(params?: CourseListParams) {
  return request.get<{ list: any[]; total: number }>({
    url: '/api/system/course/list',
    params
  })
}

export function addCourse(data: any) {
  return request.post({
    url: '/api/system/course/add',
    data
  })
}

export function updateCourse(data: any) {
  return request.put({
    url: '/api/system/course/update',
    data
  })
}

export function deleteCourse(id: string) {
  return request.del({
    url: `/api/system/course/delete/${id}`
  })
}

export function changeCourseStatus(id: string, status: number) {
  return request.post({
    url: '/api/system/course/status',
    data: { id, status }
  })
}

export function getEpisodeList(courseId: string) {
  return request.get<any[]>({
    url: '/api/system/course/episode/list',
    params: { courseId }
  })
}

export function addEpisode(data: any) {
  return request.post({
    url: '/api/system/course/episode/add',
    data
  })
}

export function updateEpisode(data: any) {
  return request.put({
    url: '/api/system/course/episode/update',
    data
  })
}

export function deleteEpisode(id: string) {
  return request.del({
    url: `/api/system/course/episode/delete/${id}`
  })
}

export function getVideoList(episodeId: string) {
  return request.get<any[]>({
    url: '/api/system/course/video/list',
    params: { episodeId }
  })
}

export function addVideo(data: any) {
  return request.post({
    url: '/api/system/course/video/add',
    data
  })
}

export function updateVideo(data: any) {
  return request.put({
    url: '/api/system/course/video/update',
    data
  })
}

export function deleteVideo(id: string) {
  return request.del({
    url: `/api/system/course/video/delete/${id}`
  })
}

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
  cdnUrl?: string
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
