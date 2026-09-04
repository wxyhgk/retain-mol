interface BrowserLocation {
  protocol: string
  hostname: string
}

let configuredBackendUrl: string | undefined

/**
 * 由应用启动时注入后端地址，统一 `VITE_RETAINMOL_BACKEND_URL` 的读取位置。
 * 包内的 infrastructure 不再直接读取 `import.meta.env`。
 */
export function configureBackendUrl(url: string | undefined) {
  configuredBackendUrl = url?.trim() ? url.trim().replace(/\/$/, '') : undefined
}

export function resolveBackendUrl(
  configuredUrl: string | undefined = configuredBackendUrl ?? import.meta.env.VITE_RETAINMOL_BACKEND_URL,
  browserLocation: BrowserLocation | undefined = typeof window === 'undefined' ? undefined : window.location,
): string {
  const configured = configuredUrl?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (browserLocation?.hostname) return `${browserLocation.protocol}//${browserLocation.hostname}:8000`
  return 'http://127.0.0.1:8000'
}

export function getBackendUrl(): string {
  return resolveBackendUrl()
}
