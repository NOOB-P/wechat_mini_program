import { fetchAddProject, fetchUpdateProject } from '@/api/core-business/exam/project';
/**
 * 添加项目
 */
export async function addProject(data) {
    return fetchAddProject(data);
}
/**
 * 更新项目
 */
export async function updateProject(data) {
    return fetchUpdateProject(data);
}
//# sourceMappingURL=ProjectDialog.js.map