import { Unzip, UnzipInflate, type FlateError, type UnzipFile } from 'fflate'

type StartMessage = {
  type: 'start'
  file: File
}

type WorkerMessage =
  | {
      type: 'progress'
      loaded: number
      total: number
      discovered: number
    }
  | {
      type: 'file'
      entryPath: string
      fileName: string
      buffer: ArrayBuffer
      size: number
      discovered: number
    }
  | {
      type: 'done'
      discovered: number
    }
  | {
      type: 'error'
      message: string
    }

const IMAGE_FILE_RE = /\.(jpg|jpeg|png)$/i

let sourceFinished = false
let pendingFiles = 0
let discoveredFiles = 0
let donePosted = false
const workerScope = self as unknown as {
  postMessage: (message: WorkerMessage, transfer?: Transferable[]) => void
}

const postWorkerMessage = (message: WorkerMessage, transfer?: Transferable[]) => {
  if (transfer && transfer.length > 0) {
    workerScope.postMessage(message, transfer)
    return
  }
  workerScope.postMessage(message)
}

const maybeFinish = () => {
  if (!donePosted && sourceFinished && pendingFiles === 0) {
    donePosted = true
    postWorkerMessage({
      type: 'done',
      discovered: discoveredFiles
    })
  }
}

const normalizeEntryPath = (value: string) => value.replace(/\\/g, '/').trim()

const extractLeafName = (entryPath: string) => {
  const normalized = normalizeEntryPath(entryPath)
  const index = normalized.lastIndexOf('/')
  return index >= 0 ? normalized.slice(index + 1) : normalized
}

const shouldSkipEntry = (entryPath: string) => {
  if (!entryPath || entryPath.endsWith('/')) return true
  if (entryPath.startsWith('__MACOSX/')) return true
  return entryPath.split('/').some((segment) => {
    const trimmed = segment.trim()
    return !trimmed || trimmed.startsWith('.')
  })
}

const joinChunks = (chunks: Uint8Array[], totalLength: number) => {
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return merged
}

const handleZipFile = (entry: UnzipFile) => {
  const entryPath = normalizeEntryPath(entry.name)
  if (shouldSkipEntry(entryPath)) {
    return
  }

  const fileName = extractLeafName(entryPath)
  if (!IMAGE_FILE_RE.test(fileName)) {
    return
  }

  discoveredFiles += 1
  pendingFiles += 1

  const chunks: Uint8Array[] = []
  let totalLength = 0

  entry.ondata = (error: FlateError | null, chunk: Uint8Array, final: boolean) => {
    if (error) {
      postWorkerMessage({
        type: 'error',
        message: `解压文件[${entryPath}]失败: ${error.message || '未知错误'}`
      })
      return
    }

    if (chunk.length > 0) {
      chunks.push(chunk.slice())
      totalLength += chunk.length
    }

    if (!final) {
      return
    }

    pendingFiles -= 1
    const merged = joinChunks(chunks, totalLength)
    postWorkerMessage(
      {
        type: 'file',
        entryPath,
        fileName,
        buffer: merged.buffer,
        size: merged.byteLength,
        discovered: discoveredFiles
      },
      [merged.buffer]
    )
    maybeFinish()
  }

  entry.start()
}

const start = async (file: File) => {
  sourceFinished = false
  pendingFiles = 0
  discoveredFiles = 0
  donePosted = false

  const unzipper = new Unzip(handleZipFile)
  unzipper.register(UnzipInflate)

  const reader = file.stream().getReader()
  let loaded = 0

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    if (!value) continue

    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value)
    loaded += chunk.byteLength
    unzipper.push(chunk, false)
    postWorkerMessage({
      type: 'progress',
      loaded,
      total: file.size,
      discovered: discoveredFiles
    })
  }

  sourceFinished = true
  unzipper.push(new Uint8Array(0), true)
  maybeFinish()
}

self.onmessage = (event: MessageEvent<StartMessage>) => {
  if (event.data?.type !== 'start' || !event.data.file) {
    return
  }

  start(event.data.file).catch((error: Error) => {
    postWorkerMessage({
      type: 'error',
      message: error?.message || '解压 zip 失败'
    })
  })
}
