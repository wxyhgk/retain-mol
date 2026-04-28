import { useState, useCallback } from 'react'
import { DEFAULT_GAUSSIAN_CONFIG, type GaussianJobConfig } from '../types'

/** Gaussian 配置状态管理 hook */
export function useGaussianConfig(initialTitle = '') {
  const [config, setConfig] = useState<GaussianJobConfig>({
    ...DEFAULT_GAUSSIAN_CONFIG,
    title: initialTitle,
  })

  const update = useCallback(<K extends keyof GaussianJobConfig>(
    key: K,
    value: GaussianJobConfig[K],
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => {
    setConfig({ ...DEFAULT_GAUSSIAN_CONFIG, title: initialTitle })
  }, [initialTitle])

  return { config, update, reset }
}
