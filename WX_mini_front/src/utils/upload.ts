const UPLOADS_SEGMENT = '/uploads/'

const stripQueryAndHash = (value: string) => value.split('#')[0].split('?')[0]

const normalizeLeadingSlash = (value: string) => {
  if (value.startsWith('uploads/')) {
    return `/${value}`
  }
  return value
}

export const getUploadPath = (value?: string) => {
  if (!value) return ''

  const cleanValue = normalizeLeadingSlash(stripQueryAndHash(value))
  if (cleanValue.startsWith(UPLOADS_SEGMENT)) {
    return cleanValue
  }

  const uploadsIndex = cleanValue.indexOf(UPLOADS_SEGMENT)
  if (uploadsIndex !== -1) {
    return cleanValue.slice(uploadsIndex)
  }

  return cleanValue
}

export const resolveUploadSrc = (value?: string, bustCache = false) => {
  if (!value) return ''

  const cleanValue = normalizeLeadingSlash(stripQueryAndHash(value))
  let resolvedValue = cleanValue

  if (cleanValue.startsWith('http://') || cleanValue.startsWith('https://')) {
    const uploadPath = getUploadPath(cleanValue)
    if (uploadPath.startsWith(UPLOADS_SEGMENT)) {
      resolvedValue = `${__VITE_SERVER_BASEURL__}${uploadPath}`
    }
  } else if (cleanValue.startsWith('/')) {
    resolvedValue = `${__VITE_SERVER_BASEURL__}${cleanValue}`
  }

  if (!bustCache) {
    return resolvedValue
  }

  const connector = resolvedValue.includes('?') ? '&' : '?'
  return `${resolvedValue}${connector}t=${Date.now()}`
}
