import { useStore } from '../data/store'
import { Link } from 'react-router-dom'

function Hero() {
  const { resume } = useStore()

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {/* Avatar */}
      <div className="mb-8 size-32 overflow-hidden rounded-full border-2 border-white/10 p-1 md:size-40">
        <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold text-white md:text-4xl">
          {resume.name.charAt(0)}
        </div>
      </div>

      {/* Headline */}
      <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
        你好，我是{' '}
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {resume.name}
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-400 md:text-xl">
        {resume.title}
        <br />
        {resume.summary}
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#projects"
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
        >
          查看作品
        </a>
        <Link
          to="/resume"
          className="rounded-full border border-white/20 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          联系我
        </Link>
      </div>

      {/* Decorative gradient blur */}
      <div className="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
    </section>
  )
}

export default Hero
