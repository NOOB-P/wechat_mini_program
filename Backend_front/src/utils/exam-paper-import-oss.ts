import OSS from 'ali-oss'

import {
  fetchImportAnswerSheetManifest,
  fetchInitAnswerSheetImportBatch,
  type ExamPaperImportBatchSession,
  type ExamPaperImportManifestFile
} from '@/api/core-business/exam/project-editor'

type ImportPhase = 'preparing' | 'uploading' | 'processing'

type ZipWorkerFileMessage = {
  type: 'file'
  entryPath: string
  fileName: string
  buffer: ArrayBuffer
  size: number
  discovered: number
}

type ZipWorkerProgressMessage = {
  type: 'progress'
  loaded: number
  total: number
  discovered: number
}

type ZipWorkerDoneMessage = {
  type: 'done'
  discovered: number
}

type ZipWorkerErrorMessage = {
  type: 'error'
  message: string
}

type ZipWorkerMessage =
  | ZipWorkerFileMessage
  | ZipWorkerProgressMessage
  | ZipWorkerDoneMessage
  | ZipWorkerErrorMessage

export interface ExamPaperImportProgressState {
  phase: ImportPhase
  current: number
  total: number
  message: string
  logs: string[]
}

export interface ExamPaperImportResult {
  batchId: string
  taskId: string
  uploadedCount: number
}

type UploadProgressCallback = (state: ExamPaperImportProgressState) => void

const DEFAULT_TIMEOUT = 120_000
const DEFAULT_RETRY_MAX = 3
const DEFAULT_UPLOAD_PARALLEL = 4

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '')

const sanitizeObjectName = (value: string) => {
  const dotIndex = value.lastIndexOf('.')
  const extension = dotIndex >= 0 ? value.slice(dotIndex).toLowerCase() : ''
  const baseName = dotIndex >= 0 ? value.slice(0, dotIndex) : value
  const sanitizedBase = baseName
    .trim()
    .replace(/[^0-9A-Za-z\u4e00-\u9fa5_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return `${sanitizedBase || 'paper'}${extension}`
}

const buildObjectKey = (prefix: string, fileName: string, index: number) => {
  const uniqueId = `${Date.now()}-${index}-${Math.random().toString(16).slice(2, 10)}`
  return `${prefix}${uniqueId}-${sanitizeObjectName(fileName)}`
}

const createOssClient = (session: ExamPaperImportBatchSession) => {
  return new OSS({
    accessKeyId: session.accessKeyId,
    accessKeySecret: session.accessKeySecret,
    stsToken: session.securityToken,
    bucket: session.bucket,
    region: session.region,
    endpoint: session.endpoint,
    cname: session.endpoint.includes(session.bucket),
    secure: true,
    timeout: Math.max(DEFAULT_TIMEOUT, session.timeoutMillis || DEFAULT_TIMEOUT),
    retryMax: session.retryMax || DEFAULT_RETRY_MAX
  })
}

const buildObjectUrl = (session: ExamPaperImportBatchSession, objectKey: string) => {
  const baseUrl = trimTrailingSlashes(session.publicBaseUrl || '')
  if (baseUrl) {
    return `${baseUrl}/${objectKey}`
  }
  return `https://${session.bucket}.${session.endpoint}/${objectKey}`
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const uploadFileWithRetry = async (
  client: any,
  objectKey: string,
  file: File,
  retryMax: number
) => {
  let lastError: unknown = null

  for (let attempt = 0; attempt <= retryMax; attempt += 1) {
    try {
      return await client.put(objectKey, file, {
        mime: file.type || 'image/jpeg'
      })
    } catch (error) {
      lastError = error
      if (attempt >= retryMax) {
        break
      }
      await delay(500 * (attempt + 1))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('上传 OSS 失败')
}

import ExamPaperZipWorker from '../workers/exam-paper-zip.worker.ts?worker'

export const importExamPaperZipByOss = (
  zipFile: File,
  params: {
    projectId: string
    subjectName: string
  },
  onProgress?: UploadProgressCallback
) => {
  let cancelled = false
  let worker: Worker | null = null

  const localLogs: string[] = []
  const pendingUploads: Promise<void>[] = []
  const uploadedManifest: ExamPaperImportManifestFile[] = []
  const waiters: Array<() => void> = []

  let discoveredCount = 0
  let uploadedCount = 0
  let activeUploads = 0
  let extractionFinished = false
  let uploadParallel = DEFAULT_UPLOAD_PARALLEL

  const emitProgress = (phase: ImportPhase, current: number, total: number, message: string) => {
    localLogs.push(message)
    onProgress?.({
      phase,
      current,
      total,
      message,
      logs: [...localLogs]
    })
  }

  const waitForSlot = async () => {
    if (activeUploads < uploadParallel) return
    await new Promise<void>((resolve) => waiters.push(resolve))
  }

  const releaseSlot = () => {
    activeUploads = Math.max(0, activeUploads - 1)
    const next = waiters.shift()
    next?.()
  }

  const promise = (async () => {
    emitProgress('preparing', 0, 1, '正在初始化上传批次...')
    const session = await fetchInitAnswerSheetImportBatch({
      projectId: params.projectId,
      subjectName: params.subjectName
    })

    if (cancelled) throw new Error('CANCELLED')

    uploadParallel = Math.max(1, Math.min(session.parallel || DEFAULT_UPLOAD_PARALLEL, DEFAULT_UPLOAD_PARALLEL))
    const client = createOssClient(session)

    const scheduleUpload = (message: ZipWorkerFileMessage) => {
      const uploadTask = (async () => {
        await waitForSlot()
        if (cancelled) return
        activeUploads += 1

        try {
          const objectKey = buildObjectKey(session.objectKeyPrefix, message.fileName, uploadedManifest.length + 1)
          const file = new File([message.buffer], message.fileName, {
            type: message.fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
          })
          await uploadFileWithRetry(client, objectKey, file, session.retryMax || DEFAULT_RETRY_MAX)
          uploadedManifest.push({
            entryPath: message.entryPath,
            originalFileName: message.fileName,
            objectKey,
            url: buildObjectUrl(session, objectKey),
            size: message.size
          })
          uploadedCount += 1
          emitProgress('uploading', uploadedCount, Math.max(discoveredCount, 1), `已上传 ${uploadedCount}/${Math.max(discoveredCount, 1)} 张图片`)
        } finally {
          releaseSlot()
        }
      })()

      pendingUploads.push(uploadTask)
    }

    emitProgress('preparing', 0, 1, '正在解析 zip 文件...')

    await new Promise<void>((resolve, reject) => {
      worker = new ExamPaperZipWorker()

      worker.onmessage = (event: MessageEvent<ZipWorkerMessage>) => {
        const message = event.data
        if (cancelled) {
          return
        }

        if (message.type === 'progress') {
          discoveredCount = Math.max(discoveredCount, message.discovered)
          emitProgress(
            discoveredCount > 0 ? 'uploading' : 'preparing',
            uploadedCount,
            Math.max(discoveredCount, 1),
            discoveredCount > 0
              ? `已解析 ${discoveredCount} 张图片，正在上传...`
              : `正在解析 zip 文件 ${Math.round((message.loaded / Math.max(message.total, 1)) * 100)}%`
          )
          return
        }

        if (message.type === 'file') {
          discoveredCount = Math.max(discoveredCount, message.discovered)
          scheduleUpload(message)
          return
        }

        if (message.type === 'done') {
          extractionFinished = true
          discoveredCount = Math.max(discoveredCount, message.discovered)
          resolve()
          return
        }

        if (message.type === 'error') {
          reject(new Error(message.message || '解析 zip 失败'))
        }
      }

      worker.onerror = () => {
        reject(new Error('解析 zip 失败'))
      }

      worker.postMessage({
        type: 'start',
        file: zipFile
      })
    })

    await Promise.all(pendingUploads)

    if (cancelled) throw new Error('CANCELLED')
    if (!extractionFinished) throw new Error('zip 文件尚未解析完成')
    if (uploadedManifest.length === 0) {
      throw new Error('zip 压缩包内没有可导入的 jpg/jpeg/png 图片')
    }

    emitProgress('processing', uploadedCount, uploadedCount, '上传完成，正在提交导入清单...')

    const result = await fetchImportAnswerSheetManifest({
      projectId: params.projectId,
      subjectName: params.subjectName,
      batchId: session.batchId,
      files: uploadedManifest
    })

    emitProgress('processing', uploadedCount, uploadedCount, '清单提交成功，正在等待后端处理...')

    return {
      batchId: session.batchId,
      taskId: result.taskId,
      uploadedCount: uploadedManifest.length
    } satisfies ExamPaperImportResult
  })()

  return {
    promise,
    cancel: () => {
      cancelled = true
      worker?.terminate()
      while (waiters.length > 0) {
        const resolve = waiters.shift()
        resolve?.()
      }
    }
  }
}
