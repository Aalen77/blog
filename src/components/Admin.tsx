import { useState } from 'react'
import { useStore, ADMIN_PASSWORD, type ResumeData, type Skill } from '../data/store'
import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'

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
                s.show
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-500'
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

function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const { projects, addProject, updateProject, deleteProject, resume, setResume } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Resume editing
  const [editResume, setEditResume] = useState(false)
  const [resumeForm, setResumeForm] = useState<ResumeData>(resume)

  function handleProjectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const id = editingId || crypto.randomUUID()
    const tags = (fd.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean)
    const project: Project = {
      id,
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      tags,
      image: (fd.get('image') as string) || '',
      link: (fd.get('link') as string) || undefined,
      github: (fd.get('github') as string) || undefined,
    }
    if (editingId) {
      updateProject(editingId, project)
    } else {
      addProject(project)
    }
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(p: Project) {
    setEditingId(p.id)
    setShowForm(true)
  }

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-24 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">管理后台</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">已认证</span>
            <Link
              to="/"
              className="rounded-full border border-white/20 px-5 py-2 text-sm transition-colors hover:bg-white/10"
            >
              返回首页
            </Link>
          </div>
        </div>

        {/* ──── Resume Section ──── */}
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
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-400">姓名</label>
                  <input
                    className={inputCls}
                    value={resumeForm.name}
                    onChange={(e) => setResumeForm({ ...resumeForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">头衔</label>
                  <input
                    className={inputCls}
                    value={resumeForm.title}
                    onChange={(e) => setResumeForm({ ...resumeForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">邮箱</label>
                  <input
                    className={inputCls}
                    value={resumeForm.email}
                    onChange={(e) => setResumeForm({ ...resumeForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">手机号</label>
                  <input
                    className={inputCls}
                    value={resumeForm.phone}
                    onChange={(e) => setResumeForm({ ...resumeForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">简介</label>
                <textarea
                  className={inputCls}
                  rows={3}
                  value={resumeForm.summary}
                  onChange={(e) => setResumeForm({ ...resumeForm, summary: e.target.value })}
                />
              </div>

              {/* Skills with toggles */}
              <SkillToggles
                skills={resumeForm.skills}
                onChange={(skills) => setResumeForm({ ...resumeForm, skills })}
              />

              {/* File upload */}
              <div>
                <label className="text-sm text-gray-400">上传简历文件（PDF / Word）</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      setResumeForm({ ...resumeForm, resumeFileName: file.name, resumeFileData: reader.result as string })
                    }
                    reader.readAsDataURL(file)
                  }}
                  className="w-full text-sm text-gray-400 file:mr-3 file:rounded-full file:border-0 file:bg-purple-500/20 file:px-4 file:py-2 file:text-sm file:text-purple-300 file:cursor-pointer"
                />
                {resumeForm.resumeFileName && (
                  <p className="mt-1 text-sm text-purple-400">已上传: {resumeForm.resumeFileName}</p>
                )}
              </div>

              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-semibold"
              >
                保存简历
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
              <p>
                <span className="text-white">{resume.name}</span> — {resume.title}
              </p>
              <p className="mt-1">{resume.summary}</p>
              <p className="mt-1">{resume.email} {resume.phone && `| ${resume.phone}`}</p>
              <p className="mt-2 text-purple-400">技能: {resume.skills.filter((s) => s.show).length} 个展示 / {resume.skills.length} 个总计</p>
            </div>
          )}
        </section>

        {/* ──── Projects Section ──── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">项目列表</h2>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
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
                  <input
                    name="title"
                    defaultValue={editingId ? projects.find((p) => p.id === editingId)?.title : ''}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">截图链接（可选）</label>
                  <input
                    name="image"
                    defaultValue={editingId ? projects.find((p) => p.id === editingId)?.image : ''}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">项目链接（可选）</label>
                  <input
                    name="link"
                    defaultValue={editingId ? projects.find((p) => p.id === editingId)?.link : ''}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">GitHub（可选）</label>
                  <input
                    name="github"
                    defaultValue={editingId ? projects.find((p) => p.id === editingId)?.github : ''}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">描述</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingId ? projects.find((p) => p.id === editingId)?.description : ''}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">技术栈（逗号分隔）</label>
                <input
                  name="tags"
                  defaultValue={editingId ? projects.find((p) => p.id === editingId)?.tags.join(', ') : ''}
                  className={inputCls}
                  required
                />
              </div>
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
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <h3 className="font-semibold text-white">{p.title}</h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-1">{p.description}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="rounded-lg border border-white/20 px-3 py-1 text-sm transition-colors hover:bg-white/10"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteProject(p.id)}
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
      </div>
    </div>
  )
}

export default Admin
