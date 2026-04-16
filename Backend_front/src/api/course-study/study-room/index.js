import { mockStudyRoomList } from '@/mock/course-study/course';
export function fetchGetStudyRoomApplyList(params) {
    return Promise.resolve({
        code: 200,
        msg: '获取成功',
        data: {
            list: mockStudyRoomList,
            total: mockStudyRoomList.length
        }
    });
}
export function fetchHandleStudyRoomApply(id, status) {
    return Promise.resolve({
        code: 200,
        msg: status === 'confirmed' ? '已确认报名' : '已拒绝报名',
        data: null
    });
}
//# sourceMappingURL=index.js.map