const ABSOLUTE_URL_RE = /^(https?:)?\/\//i

const trimValue = (value?: string) => (typeof value === 'string' ? value.trim() : '')

const stripQueryAndHash = (value: string) => value.split('#')[0].split('?')[0]

const normalizeRelativePath = (value: string) => {
  if (!value) return ''
  if (value.startsWith('/')) return value
  return `/${value}`
}

const resolveAssetBaseUrl = () => {
  const rawApiUrl = trimValue(import.meta.env.VITE_API_URL)
  if (!rawApiUrl || rawApiUrl === '/') {
    return window.location.origin
  }

  if (ABSOLUTE_URL_RE.test(rawApiUrl)) {
    return rawApiUrl.replace(/\/+$/, '')
  }

  return `${window.location.origin}${normalizeRelativePath(rawApiUrl)}`.replace(/\/+$/, '')
}

export const DEFAULT_COURSE_COVER = 'https://img.yzcdn.cn/vant/empty-image-default.png'

export const resolveUploadUrl = (value?: string) => {
  const trimmedValue = trimValue(value)
  if (!trimmedValue) return ''

  const cleanValue = stripQueryAndHash(trimmedValue)
  if (ABSOLUTE_URL_RE.test(cleanValue)) {
    return cleanValue.startsWith('//') ? `https:${cleanValue}` : cleanValue
  }

  return `${resolveAssetBaseUrl()}${normalizeRelativePath(cleanValue)}`
}
