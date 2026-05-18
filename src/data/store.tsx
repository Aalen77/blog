/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Project } from './projects'

const API_BASE = '/api'
const FETCH_TIMEOUT = 15000 // 15s — prevents infinite loading if API hangs
export const ADMIN_PASSWORD = 'gukalu123'

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export interface Skill {
  name: string
  show: boolean
}

export interface ExperienceItem {
  period: string
  role: string
  company: string
  details: string[]
}

export interface EducationItem {
  period: string
  school: string
  degree: string
  details: string[]
}

export interface ResumeData {
  name: string
  title: string
  email: string
  phone: string
  summary: string
  skills: Skill[]
  experience: ExperienceItem[]
  education: EducationItem[]
  resumeFileName?: string
  resumeFileData?: string
}

export interface ApiResult {
  ok: boolean
  error?: string
}

interface StoreContextType {
  projects: Project[]
  resume: ResumeData
  loading: boolean
  addProject: (p: Project) => Promise<ApiResult>
  updateProject: (id: string, p: Project) => Promise<ApiResult>
  deleteProject: (id: string) => void
  reorderProjects: (orderedIds: string[]) => void
  setResume: (r: ResumeData) => void
  fetchProject: (id: string) => Promise<Project | null>
}

const defaultSkills: Skill[] = [
  { name: 'VibeCoding (AI 驱动开发)', show: true },
  { name: 'AI Agents', show: true },
  { name: 'RAG', show: true },
  { name: 'Prompt Engineering', show: true },
  { name: 'LangChain', show: true },
  { name: 'Python', show: true },
  { name: 'TypeScript', show: true },
  { name: 'React', show: true },
  { name: 'FastAPI', show: true },
  { name: 'Node.js', show: true },
  { name: 'Express', show: true },
  { name: 'PostgreSQL', show: true },
  { name: 'Tailwind CSS', show: true },
  { name: 'Git & Vercel', show: true },
]

const defaultResume: ResumeData = {
  name: '古卡鲁',
  title: 'VibeCoding 全栈开发者',
  email: 'aalenkai@163.com',
  phone: '15307299123',
  summary: 'VibeCoding 践行者，擅长利用 AI 工具（Claude、Cursor 等）将创意快速转化为可用产品。计算机科学专业背景，熟悉从需求分析到部署上线的完整开发流程。专注于 AI Agent、RAG 应用与全栈 Web 开发，持续探索大模型在实际场景中的应用边界。',
  skills: defaultSkills,
  experience: [
    {
      period: '2024 — 至今',
      role: 'VibeCoding 独立开发者',
      company: '个人项目',
      details: [
        '利用 AI 工具（Claude、Cursor）独立开发全栈个人博客/作品集网站',
        '前端 React + TypeScript + Tailwind CSS，后端 Express + Neon PostgreSQL',
        '部署于 Vercel 平台，集成 PDF/Markdown 文件预览、后台管理等功能',
      ],
    },
    {
      period: '2024.8 — 2026.3',
      role: '信息技术教师 / 信息教研组长',
      company: '孝感市城市管理学校',
      details: [
        '负责多门计算机课程教学，指导学生参加市级技能竞赛并获奖',
        '担任教研组长，组织教研活动，规范教学管理流程',
      ],
    },
  ],
  education: [
    {
      period: '2020 — 2024',
      school: '湖北工程学院',
      degree: '计算机科学与技术 · 本科',
      details: [
        '主修：数据结构、算法、操作系统、计算机网络、数据库系统、Linux、C/C++、Java、Python',
        '获校级三等奖学金、创新创业大赛省级三等奖、优秀毕业生等荣誉',
      ],
    },
  ],
}

const defaultProjects: Project[] = [
  {
    id: '1', title: 'Project Alpha',
    description: '一个基于 React 和 Node.js 的全栈项目，实现了实时数据可视化和协作编辑功能。',
    tags: ['React', 'Node.js', 'WebSocket', 'PostgreSQL'], image: '', link: 'https://example.com', github: 'https://github.com',
    sort_order: 0, content: '',
  },
  {
    id: '2', title: 'Project Beta',
    description: '使用 TypeScript 开发的命令行工具，用于自动化工作流和项目脚手架搭建。',
    tags: ['TypeScript', 'CLI', 'Node.js'], image: '', link: 'https://example.com', github: 'https://github.com',
    sort_order: 1, content: '',
  },
  {
    id: '3', title: 'Project Gamma',
    description: '移动端优先的天气预报应用，集成多个数据源，支持离线缓存和推送通知。',
    tags: ['React Native', 'TypeScript', 'Redis', 'Docker'], image: '', link: 'https://example.com',
    sort_order: 2, content: '',
  },
  {
    id: '4', title: 'Project Delta',
    description: '高性能 API 网关，支持限流、熔断、服务发现和分布式追踪。',
    tags: ['Go', 'gRPC', 'Kubernetes', 'Prometheus'], image: '', github: 'https://github.com',
    sort_order: 3, content: '',
  },
]

function migrateArrayField<T>(data: unknown, defaultVal: T[]): T[] {
  if (Array.isArray(data)) return data as T[]
  if (typeof data === 'string') {
    try { const parsed = JSON.parse(data); if (Array.isArray(parsed)) return parsed as T[] } catch { /* ignore */ }
  }
  return defaultVal
}

function migrateResume(data: unknown): ResumeData {
  if (!data || typeof data !== 'object') return defaultResume
  const d = data as Record<string, unknown>
  let skills: Skill[]
  if (Array.isArray(d.skills)) {
    if (d.skills.length > 0 && typeof d.skills[0] === 'string') {
      skills = (d.skills as string[]).map((s) => ({ name: s, show: true }))
    } else {
      skills = d.skills as Skill[]
    }
  } else {
    skills = defaultSkills
  }
  return {
    name: (d.name as string) || defaultResume.name,
    title: (d.title as string) || defaultResume.title,
    email: (d.email as string) || defaultResume.email,
    phone: (d.phone as string) || defaultResume.phone,
    summary: (d.summary as string) || defaultResume.summary,
    skills,
    experience: migrateArrayField<ExperienceItem>(d.experience, defaultResume.experience),
    education: migrateArrayField<EducationItem>(d.education, defaultResume.education),
    resumeFileName: d.resumeFileName as string | undefined,
    resumeFileData: d.resumeFileData as string | undefined,
  }
}

function migrateProject(p: Record<string, unknown>): Project {
  return {
    id: p.id as string,
    title: (p.title as string) || '',
    description: (p.description as string) || '',
    tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags as string) : []),
    image: (p.image as string) || '',
    link: (p.link as string) || undefined,
    github: (p.github as string) || undefined,
    sort_order: typeof p.sort_order === 'number' ? p.sort_order : 0,
    content: (p.content as string) || '',
    contentFileName: (p.contentFileName as string) || undefined,
    contentFileData: (p.contentFileData as string) || undefined,
  }
}

// ─── API helpers ───

async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}${path}`)
    if (!res.ok) {
      console.error(`API GET ${path} failed: ${res.status}`)
      return fallback
    }
    return await res.json() as T
  } catch (e) {
    console.error(`API GET ${path} error:`, e)
    return fallback
  }
}

function isJson(res: Response): boolean {
  const ct = res.headers.get('content-type')
  return ct !== null && ct.includes('application/json')
}

async function apiPut(path: string, body: unknown): Promise<ApiResult> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ADMIN_PASSWORD}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) return { ok: false, error: `服务器错误 (${res.status})` }
    if (!isJson(res)) return { ok: false, error: 'API 未正确响应，可能是部署平台限制' }
    return { ok: true }
  } catch {
    return { ok: false, error: '网络请求失败，请检查网络连接' }
  }
}

async function apiPost(path: string, body: unknown): Promise<ApiResult> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ADMIN_PASSWORD}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) return { ok: false, error: `服务器错误 (${res.status})` }
    if (!isJson(res)) return { ok: false, error: 'API 未正确响应，可能是部署平台限制' }
    return { ok: true }
  } catch {
    return { ok: false, error: '网络请求失败，请检查网络连接' }
  }
}

async function apiDelete(path: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ADMIN_PASSWORD}` },
    })
    if (!res.ok) { console.error(`API DELETE ${path} failed: ${res.status}`); return false }
    if (!isJson(res)) { console.error(`API DELETE ${path} returned non-JSON (likely HTML) — API not reached`); return false }
    return true
  } catch (e) {
    console.error(`API DELETE ${path} error:`, e)
    return false
  }
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjectsState] = useState<Project[]>([])
  const [resume, setResumeState] = useState<ResumeData>(defaultResume)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const [apiProjects, apiResume] = await Promise.all([
        apiGet<Record<string, unknown>[]>('/projects', []),
        apiGet<ResumeData | null>('/resume', null) as Promise<ResumeData | null>,
      ])

      // Merge API projects with localStorage — keep local-only projects that failed to sync
      let merged: Project[]
      if (apiProjects.length > 0) {
        // Strip contentFileData in case the server hasn't updated yet
        merged = apiProjects.map((row) => {
          const p = migrateProject(row)
          p.contentFileData = undefined
          return p
        })
        const localRaw = localStorage.getItem('blog_projects')
        if (localRaw) {
          try {
            const localProjects: Project[] = JSON.parse(localRaw)
            const apiIds = new Set(merged.map((p) => p.id))
            for (const lp of localProjects) {
              if (!apiIds.has(lp.id)) {
                // Strip blob from localStorage-origin projects too
                merged.push({ ...lp, contentFileData: undefined })
              }
            }
          } catch { /* ignore corrupted localStorage */ }
        }
      } else {
        const localRaw = localStorage.getItem('blog_projects')
        if (localRaw) {
          try { merged = JSON.parse(localRaw) } catch { merged = defaultProjects }
        } else {
          merged = defaultProjects
        }
      }
      merged.sort((a, b) => a.sort_order - b.sort_order)
      setProjectsState(merged)
      try {
        localStorage.setItem('blog_projects', JSON.stringify(merged))
      } catch { /* localStorage full — ok */ }

      if (apiResume) {
        setResumeState(migrateResume(apiResume))
      } else {
        const local = localStorage.getItem('blog_resume')
        if (local) {
          try { setResumeState(migrateResume(JSON.parse(local))) }
          catch { setResumeState(defaultResume) }
        } else {
          setResumeState(defaultResume)
        }
      }

      setLoading(false)
      setLoaded(true)
    }
    load()
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('blog_projects', JSON.stringify(projects))
  }, [projects, loaded])

  useEffect(() => {
    if (!loaded) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { resumeFileData, ...stripped } = resume
    try {
      localStorage.setItem('blog_resume', JSON.stringify(stripped))
    } catch {
      // localStorage full — non-critical
    }
  }, [resume, loaded])

  // Strip large file blobs before localStorage to avoid QuotaExceededError
  const persistProjects = (p: Project[]) => {
    setProjectsState(p)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stripped = p.map(({ contentFileData, ...rest }) => rest)
    try {
      localStorage.setItem('blog_projects', JSON.stringify(stripped))
    } catch {
      // localStorage full — non-critical, data is in API
    }
  }

  const addProject = async (p: Project) => {
    const result = await apiPost('/projects', p)
    if (result.ok) {
      const updated = await apiGet<Record<string, unknown>[]>('/projects', [])
      if (updated.length > 0) setProjectsState(updated.map(migrateProject))
      else persistProjects([...projects, p])
    } else {
      persistProjects([...projects, p])
    }
    return result
  }

  const updateProject = async (id: string, p: Project) => {
    const result = await apiPut(`/projects/${id}`, p)
    if (result.ok) {
      const updated = await apiGet<Record<string, unknown>[]>('/projects', [])
      if (updated.length > 0) setProjectsState(updated.map(migrateProject))
      else persistProjects(projects.map((item) => (item.id === id ? p : item)))
    } else {
      persistProjects(projects.map((item) => (item.id === id ? p : item)))
    }
    return result
  }

  const deleteProject = async (id: string) => {
    await apiDelete(`/projects/${id}`)
    const updated = await apiGet<Record<string, unknown>[]>('/projects', [])
    if (updated.length > 0) setProjectsState(updated.map(migrateProject))
    else persistProjects(projects.filter((item) => item.id !== id))
  }

  const reorderProjects = async (orderedIds: string[]) => {
    const reordered = orderedIds.map((id, i) => {
      const p = projects.find((x) => x.id === id)
      return p ? { ...p, sort_order: i } : null
    }).filter(Boolean) as Project[]
    setProjectsState(reordered)
    localStorage.setItem('blog_projects', JSON.stringify(reordered))
    await apiPut('/projects/reorder', { orderedIds })
  }

  const setResume = async (r: ResumeData) => {
    setResumeState(r)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { resumeFileData, ...stripped } = r
    try {
      localStorage.setItem('blog_resume', JSON.stringify(stripped))
    } catch { /* ignore */ }
    await apiPut('/resume', r)
  }

  const fetchProject = async (id: string): Promise<Project | null> => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${id}`)
      if (!res.ok) return null
      const data = await res.json()
      return migrateProject(data)
    } catch {
      return null
    }
  }

  return (
    <StoreContext.Provider value={{ projects, resume, loading, addProject, updateProject, deleteProject, reorderProjects, setResume, fetchProject }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
