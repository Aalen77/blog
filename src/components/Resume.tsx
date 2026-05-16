import { useStore } from '../data/store'
import { Link } from 'react-router-dom'

function Resume() {
  const { resume } = useStore()
  const isPdf = resume.resumeFileName?.toLowerCase().endsWith('.pdf')

  return (
    <div className="min-h-screen bg-[#0d1117] py-24 text-white">
      {/* Nav */}
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/" className="text-sm text-gray-400 underline transition-colors hover:text-white">
          &larr; 返回首页
        </Link>
      </div>

      {/* Header */}
      <div className="mx-auto mt-12 max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8 rounded-3xl border border-white/10 bg-white/[0.02] p-10 backdrop-blur-sm md:flex-row md:text-left">
          <div className="flex size-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-3xl font-bold shadow-lg shadow-purple-500/20 md:size-32 md:text-4xl">
            {resume.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold md:text-4xl">{resume.name}</h1>
            <p className="mt-2 text-lg text-purple-400">{resume.title}</p>
            <p className="mt-3 max-w-xl leading-relaxed text-gray-400">{resume.summary}</p>
          </div>
        </div>
      </div>

      {/* Contact + Skills */}
      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        {/* Contact */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
          <h2 className="mb-5 text-lg font-semibold text-purple-400">联系方式</h2>
          <div className="space-y-4">
            <a
              href={`mailto:${resume.email}`}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-5 py-4 transition-colors hover:border-purple-500/30 hover:bg-white/10"
            >
              <span className="text-xl">✉</span>
              <span className="text-gray-300">{resume.email}</span>
            </a>
            {resume.phone && (
              <a
                href={`tel:${resume.phone}`}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-5 py-4 transition-colors hover:border-purple-500/30 hover:bg-white/10"
              >
                <span className="text-xl">📞</span>
                <span className="text-gray-300">{resume.phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
          <h2 className="mb-5 text-lg font-semibold text-purple-400">技能</h2>
          {resume.skills.filter((s) => s.show).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.skills.filter((s) => s.show).map((s) => (
                <span key={s.name} className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition-colors hover:bg-purple-500/20">
                  {s.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">暂未添加技能</p>
          )}
        </div>
      </div>

      {/* Resume File */}
      {resume.resumeFileData && (
        <div className="mx-auto mt-10 max-w-6xl px-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm">
            <h2 className="mb-5 text-lg font-semibold text-purple-400">简历文件</h2>
            {isPdf ? (
              <embed
                src={resume.resumeFileData}
                type="application/pdf"
                className="w-full rounded-xl border border-white/10"
                style={{ height: '80vh', minHeight: 500 }}
              />
            ) : (
              <a
                href={resume.resumeFileData}
                download={resume.resumeFileName || 'resume.docx'}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold transition-transform hover:scale-105"
              >
                <span>📄</span> 下载简历 ({resume.resumeFileName || '文件'})
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Resume
