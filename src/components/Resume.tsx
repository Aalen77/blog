import { useStore } from '../data/store'
import { Link } from 'react-router-dom'

function Resume() {
  const { resume } = useStore()

  const isPdf = resume.resumeFileName?.toLowerCase().endsWith('.pdf')

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-[#0d1117] px-4 py-24 text-white">
      {/* Nav */}
      <div className="mb-8">
        <Link to="/" className="text-sm text-gray-400 underline transition-colors hover:text-white">
          &larr; 返回首页
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold">
          {resume.name.charAt(0)}
        </div>
        <h1 className="text-4xl font-bold">{resume.name}</h1>
        <p className="mt-2 text-xl text-purple-400">{resume.title}</p>
        <p className="mt-4 text-gray-400">{resume.summary}</p>
      </div>

      {/* Contact */}
      <div className="mb-10 flex flex-wrap justify-center gap-6">
        <a href={`mailto:${resume.email}`} className="text-gray-400 underline transition-colors hover:text-white">
          {resume.email}
        </a>
        {resume.phone && (
          <a href={`tel:${resume.phone}`} className="text-gray-400 underline transition-colors hover:text-white">
            {resume.phone}
          </a>
        )}
      </div>

      {/* Skills */}
      {resume.skills.filter((s) => s.show).length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">技能</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.filter((s) => s.show).map((s) => (
              <span key={s.name} className="rounded-full bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Resume File Preview / Download */}
      {resume.resumeFileData && (
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">简历文件</h2>
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
              className="inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold transition-transform hover:scale-105"
            >
              下载简历 ({resume.resumeFileName || '文件'})
            </a>
          )}
        </section>
      )}

      {/* Experience */}
      
    </div>
  )
}

export default Resume
