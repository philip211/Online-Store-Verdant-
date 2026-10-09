import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Verdant] render error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-display text-4xl font-semibold text-forest-50">Something went wrong</h1>
          <p className="mt-3 max-w-md text-forest-300">We are already looking into it. Please try reloading the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-forest-50"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
