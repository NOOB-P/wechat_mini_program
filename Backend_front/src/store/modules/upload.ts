import { defineStore } from 'pinia'
import { ref } from 'vue'
import { uploadCourseVideoByOss } from '@/utils/course-video-oss'
import { addVideo, updateVideo } from '@/api/course-study/course/index'
import { ElMessage } from 'element-plus'

export interface UploadTask {
  id: string | number
  episodeId: string
  title: string
  sortOrder: number
  progress: number
  status: 'uploading' | 'saving' | 'error'
  videoUrl: string
  errorMessage?: string
  cancel?: () => void
}

export const useUploadStore = defineStore('upload', () => {
  const uploadTasks = ref<UploadTask[]>([])

  const addTask = async (formData: any, file: File, isEdit: boolean) => {
    const taskId = `upload-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    
    const { promise, cancel } = uploadCourseVideoByOss(file, (percent, message) => {
      const targetTask = uploadTasks.value.find(t => t.id === taskId)
      if (targetTask) {
        targetTask.progress = percent
        targetTask.videoUrl = message || '正在上传...'
      }
    })

    const task: UploadTask = {
      id: taskId,
      episodeId: formData.episodeId,
      title: formData.title,
      sortOrder: formData.sortOrder,
      progress: 1,
      status: 'uploading',
      videoUrl: '正在初始化上传...',
      cancel
    }

    uploadTasks.value.unshift(task)

    try {
      const videoUrl = await promise

      const targetTask = uploadTasks.value.find(t => t.id === taskId)
      if (targetTask) {
        targetTask.progress = 100
        targetTask.status = 'saving'
        targetTask.videoUrl = videoUrl
      }

      if (isEdit) {
        await updateVideo({ ...formData, videoUrl })
      } else {
        await addVideo({ ...formData, videoUrl })
      }

      // 成功后移除任务
      removeTask(taskId)
      ElMessage.success(`视频《${formData.title}》上传成功`)
      return true
    } catch (error: any) {
      const targetTask = uploadTasks.value.find(t => t.id === taskId)
      if (targetTask) {
        if (error.message === 'CANCELLED') {
           removeTask(taskId)
           return false
        }
        targetTask.status = 'error'
        targetTask.errorMessage = error?.message || '上传失败'
        targetTask.videoUrl = '上传失败，请重试'
      }
      ElMessage.error(`视频《${formData.title}》上传失败`)
      return false
    }
  }

  const removeTask = (id: string | number) => {
    uploadTasks.value = uploadTasks.value.filter(t => t.id !== id)
  }

  const cancelTask = (id: string | number) => {
    const task = uploadTasks.value.find(t => t.id === id)
    if (task && task.cancel) {
      task.cancel()
      ElMessage.info(`已取消视频《${task.title}》的上传`)
    }
    removeTask(id)
  }

  return {
    uploadTasks,
    addTask,
    removeTask,
    cancelTask
  }
})
