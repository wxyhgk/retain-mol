import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { appQueryClient } from './queryClient'

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>
}
