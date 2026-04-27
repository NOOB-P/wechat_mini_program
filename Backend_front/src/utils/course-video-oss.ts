import OSS from 'ali-oss'

import { getCourseVideoUploadSts } from '@/api/course-study/course'

const CHECKPOINT_PREFIX = 'course-video-upload'
const DEFAULT_PART_SIZE = 1 * 1024 * 1024
const DEFAULT_PARALLEL = 5
const DEFAULT_RETRY_MAX = 3
const DEFAULT_TIMEOUT = 120_000
const LARGE_FILE_THRESHOLD = 300 * 1024 * 1024

type UploadProgressCallback = (percent: number, message?: string) => void

type BrowserConnection = {
  effectiveType?: string
  saveData?: boolean
  downlink?: number
}

const getNetworkProfile = (file: File) => {
  const connection = ((navigator as Navigator & { connection?: BrowserConnection }).connection || {}) as BrowserConnection

  let parallel = DEFAULT_PARALLEL
  let timeout = DEFAULT_TIMEOUT

  if (file.size >= LARGE_FILE_THRESHOLD) {
    parallel = 3
    timeout = 600_000
  }

  if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    parallel = 2
    timeout = Math.max(timeout, 600_000)
  } else if (connection.effectiveType === '3g' || (typeof connection.downlink === 'number' && connection.downlink > 0 && connection.downlink < 2)) {
    parallel = 3
    timeout = Math.max(timeout, 300_000)
  }

  if (typeof connection.downlink === 'number' && connection.downlink > 0 && connection.downlink < 1) {
    parallel = 2
    timeout = Math.max(timeout, 600_000)
  }

  return {
    parallel,
    timeout
  }
}

const getCheckpointStorageKey = (objectKey: string, file: File) => {
  return `${CHECKPOINT_PREFIX}:${objectKey}:${file.size}:${file.lastModified}`
}

const loadCheckpoint = (storageKey: string) => {
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    window.localStorage.removeItem(storageKey)
    return null
  }
}

const saveCheckpoint = (storageKey: string, checkpoint: unknown) => {
  window.localStorage.setItem(storageKey, JSON.stringify(checkpoint))
}

const clearCheckpoint = (storageKey: string) => {
  window.localStorage.removeItem(storageKey)
}

export const uploadCourseVideoByOss = (file: File, onProgress?: UploadProgressCallback) => {
  let client: any = null
  let isCancelled = false

  const promise = (async () => {
    const sts = await getCourseVideoUploadSts({
      scene: 'course-video',
      fileName: file.name,
      contentType: file.type || 'video/mp4'
    })

    if (isCancelled) throw new Error('CANCELLED')

    const networkProfile = getNetworkProfile(file)
    const storageKey = getCheckpointStorageKey(sts.objectKey, file)
    const checkpoint = loadCheckpoint(storageKey)
    const partSize = sts.partSize || DEFAULT_PART_SIZE
    const totalParts = Math.max(1, Math.ceil(file.size / partSize))
    const parallel = Math.min(sts.parallel || DEFAULT_PARALLEL, networkProfile.parallel)
    const timeout = Math.max(networkProfile.timeout, sts.timeoutMillis || DEFAULT_TIMEOUT)

    onProgress?.(1, checkpoint ? '检测到断点，正在续传...' : '正在初始化分片上传...')
    
    client = new OSS({
      accessKeyId: sts.accessKeyId,
      accessKeySecret: sts.accessKeySecret,
      stsToken: sts.securityToken,
      bucket: sts.bucket,
      region: sts.region,
      endpoint: sts.endpoint,
      cname: sts.endpoint.includes(sts.bucket),
      secure: true,
      timeout,
      retryMax: sts.retryMax || DEFAULT_RETRY_MAX
    })

    try {
      const result = await client.multipartUpload(sts.objectKey, file, {
        parallel,
        partSize,
        checkpoint,
        mime: file.type || 'video/mp4',
        timeout,
        progress: (p: any, cpt: any) => {
          if (isCancelled) {
            client?.cancel()
            return
          }
          saveCheckpoint(storageKey, cpt)
          const percent = Math.floor(p * 100)
          const currentPart = Math.min(totalParts, Math.ceil(p * totalParts))
          onProgress?.(percent, `正在上传分片 ${currentPart}/${totalParts}`)
        }
      })

      clearCheckpoint(storageKey)
      onProgress?.(100, '上传完成，正在写入地址...')
      return result.res.status === 200 
        ? (sts.publicUrl || sts.cdnUrl || `https://${sts.bucket}.${sts.endpoint}/${sts.objectKey}`)
        : ""
    } catch (error: any) {
      if (isCancelled || error.name === 'cancel' || error.message === 'cancel') {
        throw new Error('CANCELLED')
      }
      throw error
    }
  })()

  return {
    promise,
    cancel: () => {
      isCancelled = true
      if (client) {
        try {
          client.cancel()
        } catch (e) {
          // ignore
        }
      }
    }
  }
}
