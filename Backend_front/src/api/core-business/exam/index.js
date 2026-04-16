import { mockExamList } from '@/mock/core-business/exam';
/** 获取考试列表 */
export function fetchGetExamList(params) {
    const { current = 1, size = 10, name, school, grade, className } = params;
    // 模拟搜索过滤
    let filteredList = [...mockExamList];
    if (name)
        filteredList = filteredList.filter(item => item.name.includes(name));
    if (school)
        filteredList = filteredList.filter(item => item.school === school);
    if (grade)
        filteredList = filteredList.filter(item => item.grade === grade);
    if (className)
        filteredList = filteredList.filter(item => item.className === className);
    const total = filteredList.length;
    const start = (current - 1) * size;
    const end = start + size;
    const records = filteredList.slice(start, end);
    return Promise.resolve({
        code: 200,
        msg: '获取成功',
        data: {
            records,
            total,
            current,
            size
        }
    });
}
/** 删除考试 */
export function fetchDeleteExam(id) {
    return Promise.resolve({
        code: 200,
        msg: '删除成功',
        data: null
    });
}
//# sourceMappingURL=index.js.map