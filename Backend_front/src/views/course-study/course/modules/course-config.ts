export type CourseScope = 'all' | 'normal' | 'svip'

export interface CourseCategory {
  id: string
  name: string
  count: number
}

export const courseScopeOptions = [
  { label: '全部', value: 'all' },
  { label: '普通课程', value: 'normal' },
  { label: 'SVIP 课程', value: 'svip' }
] as const

export const createCourseCategories = (): CourseCategory[] => [
  { id: 'general', name: '常规课程', count: 0 },
  { id: 'talk', name: '学霸说', count: 0 },
  { id: 'family', name: '家庭教育', count: 0 },
  { id: 'sync', name: '同步/专题课', count: 0 }
]
