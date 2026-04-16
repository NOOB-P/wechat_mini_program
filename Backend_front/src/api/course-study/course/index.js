import request from '@/utils/http';
/** 获取课程列表 */
export function getCourseList(params) {
    return request.get({
        url: '/api/system/course/list',
        params
    });
}
/** 新增课程 */
export function addCourse(data) {
    return request.post({
        url: '/api/system/course/add',
        data
    });
}
/** 更新课程 */
export function updateCourse(data) {
    return request.put({
        url: '/api/system/course/update',
        data
    });
}
/** 删除课程 */
export function deleteCourse(id) {
    return request.del({
        url: `/api/system/course/delete/${id}`
    });
}
/** 修改课程状态 */
export function changeCourseStatus(id, status) {
    return request.post({
        url: '/api/system/course/status',
        data: { id, status }
    });
}
/** 获取课程章节列表 */
export function getEpisodeList(courseId) {
    return request.get({
        url: '/api/system/course/episode/list',
        params: { courseId }
    });
}
/** 新增课程章节 */
export function addEpisode(data) {
    return request.post({
        url: '/api/system/course/episode/add',
        data
    });
}
/** 更新课程章节 */
export function updateEpisode(data) {
    return request.put({
        url: '/api/system/course/episode/update',
        data
    });
}
/** 删除课程章节 */
export function deleteEpisode(id) {
    return request.del({
        url: `/api/system/course/episode/delete/${id}`
    });
}
/** 获取章节视频列表 */
export function getVideoList(episodeId) {
    return request.get({
        url: '/api/system/course/video/list',
        params: { episodeId }
    });
}
/** 新增章节视频 */
export function addVideo(data) {
    return request.post({
        url: '/api/system/course/video/add',
        data
    });
}
/** 更新章节视频 */
export function updateVideo(data) {
    return request.put({
        url: '/api/system/course/video/update',
        data
    });
}
/** 删除章节视频 */
export function deleteVideo(id) {
    return request.del({
        url: `/api/system/course/video/delete/${id}`
    });
}
/** 上传封面 */
export function uploadCourseCover(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post({
        url: '/api/system/course/upload-cover',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}
//# sourceMappingURL=index.js.map