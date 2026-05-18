import { useParams, Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { useState, useEffect, useMemo } from 'react'

function decodeContentFileData(dataUri: string): string {
  const commaIdx = dataUri.indexOf(',')
  if (commaIdx === -1) return ''
  const payload = dataUri.slice(commaIdx + 1)
  const meta = dataUri.slice(0, commaIdx)
  if (meta.includes(';base64')) {
    const binary = atob(payload)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder('utf-8').decode(bytes)
  }
  return decodeURIComponent(payload)
}

function dataUriToBlobUrl(dataUri: string): string | null {
  try {
    const commaIdx = dataUri.indexOf(',')
    if (commaIdx === -1) return null
    const meta = dataUri.slice(0, commaIdx)
    const payload = dataUri.slice(commaIdx + 1)
    const mimeMatch = meta.match(/data:(.*?)(;|$)/)
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
    if (meta.includes(';base64')) {
      const binary = atob(payload)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      return URL.createObjectURL(new Blob([bytes], { type: mime }))
    }
    return URL.createObjectURL(new Blob([decodeURIComponent(payload)], { type: mime }))
  } catch {
    return null
  }
}

const gradientBgs = [
  'from-purple-600 to-blue-500',
  'from-pink-500 to-orange-400',
  'from-teal-400 to-cyan-500',
  'from-rose-500 to-purple-600',
]

function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { projects, fetchProject } = useStore()
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [fetchedData, setFetchedData] = useState<Project | null>(null)
  const [fetching, setFetching] = useState(false)

  const baseProject = projects.find((p) => p.id === id)

  useEffect(() => {
    if (!id) return
    const base = projects.find((p) => p.id === id)
    if (!base || !base.contentFileName) return
    if (base.contentFileData) return
    if (fetchedData && fetchedData.id === id) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetching(true)
    fetchProject(id).then((p) => {
      if (!cancelled && p) setFetchedData(p)
      if (!cancelled) setFetching(false)
    })
    return () => { cancelled = true }
  }, [id, projects, fetchedData, fetchProject])

  const project: Project = (fetchedData && fetchedData.id === baseProject.id)
    ? { ...baseProject, contentFileData: fetchedData.contentFileData, contentFileName: fetchedData.contentFileName || baseProject.contentFileName }
    : baseProject

  const ext = project.contentFileName?.split('.').pop()?.toLowerCase()
  const isPdf = ext === 'pdf'
  const isMd = ext === 'md'
  const isDoc = ext === 'doc' || ext === 'docx'

  const pdfBlobUrl = useMemo(() => {
    if (!project.contentFileData || !isPdf) return null
    return dataUriToBlobUrl(project.contentFileData)
  }, [project.contentFileData, isPdf])

  useEffect(() => {
    return () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl) }
  }, [pdfBlobUrl])

  if (!baseProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
        <div className="text-center">
          <p className="text-xl text-gray-400">项目不存在</p>
          <Link to="/" className="mt-4 inline-block text-purple-400 underline">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-24 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link to="/" className="mb-8 inline-block text-sm text-gray-400 underline transition-colors hover:text-white">
          &larr; 返回首页
        </Link>

        {/* Header image */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10">
          {project.image ? (
            <img src={project.image} alt={project.title} className="aspect-video w-full object-cover" />
          ) : (
            <div
              className={`flex aspect-video w-full items-center justify-center bg-gradient-to-br ${gradientBgs[0]}`}
            >
              <span className="text-6xl font-bold text-white/30">{project.title.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold md:text-5xl">{project.title}</h1>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="mt-6 text-lg leading-relaxed text-gray-300">{project.description}</p>

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-semibold transition-transform hover:scale-105"
            >
              访问项目
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-6 py-2 font-semibold transition-colors hover:bg-white/10"
            >
              GitHub
            </a>
          )}
        </div>

        {/* Uploaded file content */}
        {fetching && project.contentFileName && (
          <div className="mt-12 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-4 border-white/20 border-t-purple-400" />
              <p className="text-sm text-gray-400">加载文件中...</p>
            </div>
          </div>
        )}
        {project.contentFileData && !fetching && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8">
            {isPdf && (
              <div className="relative" key={pdfBlobUrl}>
                {!pdfLoaded && (
                  <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5" style={{ height: '80vh', minHeight: 500 }}>
                    <div className="text-center">
                      <div className="mx-auto mb-3 size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple-400" />
                      <p className="text-sm text-gray-400">PDF 加载中...</p>
                    </div>
                  </div>
                )}
                <embed
                  src={pdfBlobUrl || ''}
                  type="application/pdf"
                  className={`w-full rounded-xl ${pdfLoaded ? '' : 'absolute inset-0 opacity-0'}`}
                  style={{ height: '80vh', minHeight: 500 }}
                  onLoad={() => setPdfLoaded(true)}
                />
              </div>
            )}
            {isMd && (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">{decodeContentFileData(project.contentFileData!)}</pre>
            )}
            {isDoc && (
              <div className="text-center">
                <p className="mb-4 text-gray-400">Word 文档</p>
                <a
                  href={project.contentFileData}
                  download={project.contentFileName || 'document.docx'}
                  className="inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold transition-transform hover:scale-105"
                >
                  下载 {project.contentFileName}
                </a>
              </div>
            )}
          </div>
        )}

        {/* HTML content */}
        {project.content && !project.contentFileData && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8">
            <div
              className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-purple-400 prose-strong:text-white prose-code:text-purple-300 prose-ul:text-gray-300 prose-ol:text-gray-300"
              dangerouslySetInnerHTML={{ __html: project.content }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail
