import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4">
          <div className="max-w-md text-center">
            <p className="text-xl font-semibold text-white">页面出错了</p>
            <p className="mt-2 text-sm text-gray-400">{this.state.error.message}</p>
            <button
              onClick={() => {
                this.setState({ error: null })
                window.location.reload()
              }}
              className="mt-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-semibold text-white transition-transform hover:scale-105"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
