/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Project } from './projects'

const API_BASE = '/api'
export const ADMIN_PASSWORD = 'gukalu123'

export interface Skill {
  name: string
  show: boolean
}

export interface ResumeData {
  name: string
  title: string
  email: string
  phone: string
  summary: string
  skills: Skill[]
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
  { name: 'Python', show: true },
  { name: 'LangChain', show: true },
  { name: 'React', show: true },
  { name: 'TypeScript', show: true },
  { name: 'AI Agents', show: true },
  { name: 'RAG', show: true },
  { name: 'Prompt Engineering', show: true },
  { name: 'FastAPI', show: true },
]

const defaultResume: ResumeData = {
  name: '古卡鲁',
  title: 'AI 应用探索者',
  email: 'aalenkai@163.com',
  phone: '15307299123',
  summary: 'VibeCoding 践行者，热衷于用 AI 加速创意落地，专注将大模型能力转化为实用的产品体验。',
  skills: defaultSkills,
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
    const res = await fetch(`${API_BASE}${path}`)
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
    const res = await fetch(`${API_BASE}${path}`, {
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
    const res = await fetch(`${API_BASE}${path}`, {
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
    const res = await fetch(`${API_BASE}${path}`, {
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
        merged = apiProjects.map(migrateProject)
        const localRaw = localStorage.getItem('blog_projects')
        if (localRaw) {
          try {
            const localProjects: Project[] = JSON.parse(localRaw)
            const apiIds = new Set(merged.map((p) => p.id))
            for (const lp of localProjects) {
              if (!apiIds.has(lp.id)) {
                merged.push(lp)
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
      localStorage.setItem('blog_projects', JSON.stringify(merged))

      if (apiResume) {
        setResumeState(migrateResume(apiResume))
      } else {
        const local = localStorage.getItem('blog_resume')
        if (local) setResumeState(migrateResume(JSON.parse(local)))
        else setResumeState(defaultResume)
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
      const res = await fetch(`${API_BASE}/projects/${id}`)
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
