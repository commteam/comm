import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-6 bg-fluent-neutral-10 dark:bg-fluent-neutral-140 p-8">
          <div className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div className="text-center max-w-md">
            <h1 className="text-lg font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-fluent-neutral-80 dark:text-fluent-neutral-90 mb-1">
              {this.state.error.message}
            </p>
            <p className="text-xs text-fluent-neutral-60 dark:text-fluent-neutral-100 font-mono bg-fluent-neutral-20 dark:bg-fluent-neutral-120 rounded-fluent px-3 py-2 mt-3 text-left overflow-auto max-h-32">
              {this.state.error.stack}
            </p>
          </div>
          <button
            onClick={this.reset}
            className="flex items-center gap-2 px-4 py-2 rounded-fluent bg-fluent-accent text-white text-sm font-medium hover:bg-fluent-accent-dark transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
