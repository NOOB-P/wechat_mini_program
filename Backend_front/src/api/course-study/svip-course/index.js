import request from '@/utils/http';
/**
 * 获取 SVIP 课程列表
 */
export function fetchGetSvipCourseList(params) {
    return request.get({
        url: '/api/system/course/list',
        params: { ...params, isSvipOnly: true }
    });
}
/**
 * 删除 SVIP 课程
 */
export function fetchDeleteSvipCourse(id) {
    return request.del({
        url: `/api/system/course/delete/${id}`
    });
}
/**
 * 修改 SVIP 课程状态
 */
export function fetchChangeSvipCourseStatus(id, status) {
    return request.post({
        url: '/api/system/course/status',
        data: { id, status }
    });
}
/**
 * 新增/更新 SVIP 课程
 */
export function fetchSaveSvipCourse(data) {
    const isEdit = !!data.id;
    const payload = { ...data, isSvipOnly: true };
    if (isEdit) {
        return request.put({
            url: '/api/system/course/update',
            data: payload
        });
    }
    return request.post({
        url: '/api/system/course/add',
        data: payload
    });
}
/** 获取课程章节列表 */
export function fetchGetEpisodeList(courseId) {
    return request.get({
        url: '/api/system/course/episode/list',
        params: { courseId }
    });
}
/** 新增课程章节 */
export function fetchAddEpisode(data) {
    return request.post({
        url: '/api/system/course/episode/add',
        data
    });
}
/** 更新课程章节 */
export function fetchUpdateEpisode(data) {
    return request.put({
        url: '/api/system/course/episode/update',
        data
    });
}
/** 删除课程章节 */
export function fetchDeleteEpisode(id) {
    return request.del({
        url: `/api/system/course/episode/delete/${id}`
    });
}
/** 获取章节视频列表 */
export function fetchGetVideoList(episodeId) {
    return request.get({
        url: '/api/system/course/video/list',
        params: { episodeId }
    });
}
/** 新增章节视频 */
export function fetchAddVideo(data) {
    return request.post({
        url: '/api/system/course/video/add',
        data
    });
}
/** 更新章节视频 */
export function fetchUpdateVideo(data) {
    return request.put({
        url: '/api/system/course/video/update',
        data
    });
}
/** 删除章节视频 */
export function fetchDeleteVideo(id) {
    return request.del({
        url: `/api/system/course/video/delete/${id}`
    });
}
//# sourceMappingURL=index.js.map