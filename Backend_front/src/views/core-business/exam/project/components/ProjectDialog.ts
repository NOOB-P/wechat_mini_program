import {
  fetchAddProject,
  fetchUpdateProject,
  type ExamProjectForm
} from '@/api/core-business/exam/project'

/**
 * 添加项目
 */
export async function addProject(data: ExamProjectForm) {
  return fetchAddProject(data)
}

/**
 * 更新项目
 */
export async function updateProject(data: ExamProjectForm) {
  return fetchUpdateProject(data)
}
