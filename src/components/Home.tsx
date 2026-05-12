import Hero from './Hero'
import Projects from './Projects'
import { Link } from 'react-router-dom'
import { useStore } from '../data/store'

function Home() {
  const { loading } = useStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
        <div className="text-center text-gray-400">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header nav */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <Link
          to="/admin"
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          管理
        </Link>
      </header>

      <Hero />
      <Projects />

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} 古卡鲁. All rights reserved.
      </footer>
    </div>
  )
}

export default Home
