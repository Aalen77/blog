import { useState, useRef, type DragEvent } from 'react'
import { useStore, ADMIN_PASSWORD, type ResumeData, type Skill } from '../data/store'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { showToast } from './Toast'

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-purple-500'

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      sessionStorage.setItem('admin_token', pwd)
      onLogin()
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">管理后台</h1>
        <p className="mb-8 text-gray-400">请输入密码</p>
        <input
          type="password"
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setError(false) }}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-white outline-none focus:border-purple-500"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-red-400">密码错误，请重试</p>}
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold transition-transform hover:scale-105"
        >
          进入
        </button>
      </form>
    </div>
  )
}

function SkillToggles({
  skills,
  onChange,
}: {
  skills: Skill[]
  onChange: (skills: Skill[]) => void
}) {
  function toggle(idx: number) {
    const next = skills.map((s, i) => (i === idx ? { ...s, show: !s.show } : s))
    onChange(next)
  }

  function removeSkill(idx: number) {
    onChange(skills.filter((_, i) => i !== idx))
  }

  function addSkill() {
    onChange([...skills, { name: '', show: true }])
  }

  function updateName(idx: number, name: string) {
    onChange(skills.map((s, i) => (i === idx ? { ...s, name } : s)))
  }

  return (
    <div>
      <label className="text-sm text-gray-400">技能（开关控制展示）</label>
      <div className="mt-2 space-y-2">
        {skills.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggle(i)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                s.show ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-500'
              }`}
            >
              {s.show ? '显示' : '隐藏'}
            </button>
            <input
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-purple-500"
              value={s.name}
              onChange={(e) => updateName(i, e.target.value)}
              placeholder="技能名称"
            />
            <button
              type="button"
              onClick={() => removeSkill(i)}
              className="shrink-0 text-sm text-red-400 hover:text-red-300"
            >
              删除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSkill}
          className="mt-1 rounded-full border border-white/20 px-4 py-1 text-sm text-gray-400 transition-colors hover:bg-white/10"
        >
          + 添加技能
        </button>
      </div>
    </div>
  )
}

function DropZone({
  accept,
  fileName,
  onFile,
  label,
}: {
  accept: string
  fileName: string
  onFile: (file: File) => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragover, setDragover] = useState(false)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  function handleChange() {
    const file = inputRef.current?.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-1 cursor-pointer rounded-xl border-2 border-dashed px-6 py-5 text-center transition-colors ${
          dragover
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-white/10 bg-white/5 hover:border-white/20'
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        {fileName ? (
          <p className="text-sm text-purple-400">{fileName}</p>
        ) : (
          <p className="text-sm text-gray-500">拖拽文件到此处，或点击选择</p>
        )}
      </div>
    </div>
  )
}

function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const { projects, addProject, updateProject, deleteProject, reorderProjects, resume, setResume } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<'projects' | 'resume'>('projects')

  const [editResume, setEditResume] = useState(false)
  const [resumeForm, setResumeForm] = useState<ResumeData>(resume)

  const [contentFileName, setContentFileName] = useState('')
  const [contentFileData, setContentFileData] = useState('')
  const [imageFileName, setImageFileName] = useState('')
  const [imageFileData, setImageFileData] = useState('')

  // Drag-and-drop reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  function handleProjectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const id = editingId || crypto.randomUUID()
    const tags = (fd.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean)
    const existing = editingId ? projects.find((p) => p.id === editingId) : null
    const project: Project = {
      id,
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      tags,
      image: imageFileData || (fd.get('image_url') as string) || existing?.image || '',
      link: (fd.get('link') as string) || undefined,
      github: (fd.get('github') as string) || undefined,
      sort_order: existing?.sort_order ?? projects.length,
      content: (fd.get('content') as string) || '',
      contentFileName: contentFileName || existing?.contentFileName,
      contentFileData: contentFileData || existing?.contentFileData,
    }
    if (editingId) {
      updateProject(editingId, project)
      showToast('项目已更新')
    } else {
      addProject(project)
      showToast('项目已添加')
    }
    setEditingId(null)
    setShowForm(false)
    setContentFileName('')
    setContentFileData('')
    setImageFileName('')
    setImageFileData('')
  }

  function startEdit(p: Project) {
    setEditingId(p.id)
    setShowForm(true)
    setContentFileName(p.contentFileName || '')
    setContentFileData(p.contentFileData || '')
    setImageFileName(p.image ? '已上传图片' : '')
    setImageFileData(p.image || '')
  }

  function handleDelete(id: string) {
    deleteProject(id)
    showToast('项目已删除')
  }

  function moveProject(index: number, direction: 1 | -1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= projects.length) return
    const ordered = [...projects]
    ;[ordered[index], ordered[newIndex]] = [ordered[newIndex], ordered[index]]
    reorderProjects(ordered.map((p) => p.id))
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const ordered = [...projects]
    const [moved] = ordered.splice(dragIndex, 1)
    ordered.splice(index, 0, moved)
    reorderProjects(ordered.map((p) => p.id))
    setDragIndex(index)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  function readFileAsDataURL(file: File, onDone: (name: string, data: string) => void) {
    const reader = new FileReader()
    reader.onload = () => onDone(file.name, reader.result as string)
    reader.readAsDataURL(file)
  }

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">管理后台</h1>
          <Link
            to="/"
            className="rounded-full border border-white/20 px-5 py-2 text-sm transition-colors hover:bg-white/10"
          >
            返回首页
          </Link>
        </div>

        <div className="mb-8 flex gap-2">
          {(['projects', 'resume'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-purple-500 text-white' : 'border border-white/20 text-gray-400 hover:bg-white/10'
              }`}
            >
              {t === 'projects' ? '项目' : '简历'}
            </button>
          ))}
        </div>

        {/* ──── Resume Section ──── */}
        {tab === 'resume' && (
          <section className="mb-16">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">简历信息</h2>
              <button
                onClick={() => {
                  setEditResume(!editResume)
                  setResumeForm(resume)
                }}
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition-colors hover:bg-white/10"
              >
                {editResume ? '取消' : '编辑'}
              </button>
            </div>

            {editResume ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setResume(resumeForm)
                  setEditResume(false)
                  showToast('简历已保存')
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-400">姓名</label>
                    <input className={inputCls} value={resumeForm.name} onChange={(e) => setResumeForm({ ...resumeForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">头衔</label>
                    <input className={inputCls} value={resumeForm.title} onChange={(e) => setResumeForm({ ...resumeForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">邮箱</label>
                    <input className={inputCls} value={resumeForm.email} onChange={(e) => setResumeForm({ ...resumeForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">手机号</label>
                    <input className={inputCls} value={resumeForm.phone} onChange={(e) => setResumeForm({ ...resumeForm, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">简介</label>
                  <textarea className={inputCls} rows={3} value={resumeForm.summary} onChange={(e) => setResumeForm({ ...resumeForm, summary: e.target.value })} />
                </div>
                <SkillToggles skills={resumeForm.skills} onChange={(skills) => setResumeForm({ ...resumeForm, skills })} />
                <DropZone
                  accept=".pdf,.doc,.docx"
                  fileName={resumeForm.resumeFileName || ''}
                  onFile={(file) => readFileAsDataURL(file, (name, data) => setResumeForm({ ...resumeForm, resumeFileName: name, resumeFileData: data }))}
                  label="上传简历文件（PDF / Word）"
                />
                <button type="submit" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-semibold">
                  保存简历
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                <p><span className="text-white">{resume.name}</span> — {resume.title}</p>
                <p className="mt-1">{resume.summary}</p>
                <p className="mt-1">{resume.email} {resume.phone && `| ${resume.phone}`}</p>
                <p className="mt-2 text-purple-400">技能: {resume.skills.filter((s) => s.show).length} 个展示 / {resume.skills.length} 个总计</p>
              </div>
            )}
          </section>
        )}

        {/* ──── Projects Section ──── */}
        {tab === 'projects' && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">项目列表</h2>
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingId(null)
                  setContentFileName('')
                  setContentFileData('')
                  setImageFileName('')
                  setImageFileData('')
                }}
                className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-sm font-semibold transition-transform hover:scale-105"
              >
                添加项目
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleProjectSubmit} className="mb-8 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-400">项目名称</label>
                    <input name="title" defaultValue={editingId ? projects.find((p) => p.id === editingId)?.title : ''} className={inputCls} required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">项目链接（可选）</label>
                    <input name="link" defaultValue={editingId ? projects.find((p) => p.id === editingId)?.link : ''} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">GitHub（可选）</label>
                    <input name="github" defaultValue={editingId ? projects.find((p) => p.id === editingId)?.github : ''} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">外部图片链接（可选）</label>
                    <input name="image_url" defaultValue={editingId ? (!editingId ? '' : projects.find((p) => p.id === editingId)?.image?.startsWith('http') ? projects.find((p) => p.id === editingId)?.image : '') : ''} className={inputCls} placeholder="https://..." />
                  </div>
                </div>
                <DropZone
                  accept=".png,.jpg,.jpeg"
                  fileName={imageFileName}
                  onFile={(file) => readFileAsDataURL(file, (name, data) => { setImageFileName(name); setImageFileData(data) })}
                  label="页面图片（支持 PNG / JPG / JPEG，拖拽或点击上传）"
                />
                <div>
                  <label className="text-sm text-gray-400">描述</label>
                  <textarea name="description" rows={3} defaultValue={editingId ? projects.find((p) => p.id === editingId)?.description : ''} className={inputCls} required />
                </div>
                <div>
                  <label className="text-sm text-gray-400">技术栈（逗号分隔）</label>
                  <input name="tags" defaultValue={editingId ? projects.find((p) => p.id === editingId)?.tags.join(', ') : ''} className={inputCls} required />
                </div>
                <div>
                  <label className="text-sm text-gray-400">项目详情内容（支持 HTML 直接编写）</label>
                  <textarea name="content" rows={8} defaultValue={editingId ? projects.find((p) => p.id === editingId)?.content : ''} className={inputCls} placeholder="<h2>项目简介</h2><p>在这里编写详细的介绍内容...</p>" />
                </div>
                <DropZone
                  accept=".pdf,.md,.doc,.docx"
                  fileName={contentFileName}
                  onFile={(file) => readFileAsDataURL(file, (name, data) => { setContentFileName(name); setContentFileData(data) })}
                  label="或上传详情文件（PDF / Markdown / Word）"
                />
                <div className="flex gap-3">
                  <button type="submit" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-semibold">
                    {editingId ? '更新' : '添加'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="rounded-full border border-white/20 px-6 py-2 transition-colors hover:bg-white/10">
                    取消
                  </button>
                </div>
              </form>
            )}

            {projects.length === 0 ? (
              <p className="text-gray-500">暂无项目，点击上方按钮添加</p>
            ) : (
              <div className="space-y-3">
                {projects.map((p, index) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between rounded-xl border bg-white/5 p-4 transition-all ${
                      dragIndex === index
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10'
                    } ${dragIndex !== null ? 'cursor-grabbing' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="cursor-grab text-gray-500 transition-colors hover:text-white"
                        title="拖拽排序"
                      >
                        ⠿
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveProject(index, -1)}
                          disabled={index === 0}
                          className="rounded px-1.5 text-xs text-gray-500 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="上移"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveProject(index, 1)}
                          disabled={index === projects.length - 1}
                          className="rounded px-1.5 text-xs text-gray-500 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="下移"
                        >
                          ▼
                        </button>
                      </div>
                      {p.image && (
                        <img src={p.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{p.title}</h3>
                        <p className="mt-1 text-sm text-gray-400 line-clamp-1">{p.description}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.tags.map((t) => (
                            <span key={t} className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        to={`/project/${p.id}`}
                        className="rounded-lg border border-white/20 px-3 py-1 text-sm transition-colors hover:bg-white/10"
                      >
                        查看
                      </Link>
                      <button
                        onClick={() => startEdit(p)}
                        className="rounded-lg border border-white/20 px-3 py-1 text-sm transition-colors hover:bg-white/10"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export default Admin
