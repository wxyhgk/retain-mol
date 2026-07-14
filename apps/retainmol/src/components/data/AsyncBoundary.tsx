import * as React from 'react'

import { cn } from '@/lib/utils'
import { didResetKeysChange } from './asyncBoundaryReset'

export interface AsyncBoundaryErrorFallbackProps {
  error: Error
  reset: () => void
}

export type AsyncBoundaryErrorFallback =
  | React.ReactNode
  | ((props: AsyncBoundaryErrorFallbackProps) => React.ReactNode)

export interface AsyncBoundaryProps {
  children: React.ReactNode
  pendingFallback?: React.ReactNode
  errorFallback?: AsyncBoundaryErrorFallback
  resetKeys?: readonly unknown[]
  onError?: (error: Error, info: React.ErrorInfo) => void
  onReset?: () => void
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: AsyncBoundaryErrorFallback
  resetKeys: readonly unknown[]
  onError?: (error: Error, info: React.ErrorInfo) => void
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

function DefaultPendingFallback() {
  return (
    <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground" role="status" aria-live="polite">
      <span className="mr-2 size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" aria-hidden="true" />
      Loading
    </div>
  )
}

function DefaultErrorFallback({ reset }: AsyncBoundaryErrorFallbackProps) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center gap-3 p-4 text-center" role="alert">
      <p className="text-sm text-destructive">Unable to display this content.</p>
      <button
        type="button"
        className={cn(
          'inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium',
          'outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
        )}
        onClick={reset}
      >
        Try again
      </button>
    </div>
  )
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (
      this.state.error
      && didResetKeysChange(previousProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset()
    }
  }

  private reset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const fallback = this.props.fallback === undefined
      ? DefaultErrorFallback
      : this.props.fallback
    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.reset })
    }

    return fallback
  }
}

export function AsyncBoundary({
  children,
  pendingFallback = <DefaultPendingFallback />,
  errorFallback,
  resetKeys = [],
  onError,
  onReset,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={errorFallback}
      resetKeys={resetKeys}
      onError={onError}
      onReset={onReset}
    >
      <React.Suspense fallback={pendingFallback}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  )
}
