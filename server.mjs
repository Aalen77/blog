import express from 'express'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/personal_blog'
// Use unpooled connection for writes with large payloads (Neon proxy limits pooled connections)
const DATABASE_URL_UNPOOLED = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || DATABASE_URL

function sql(strings, ...values) {
  const db = neon(DATABASE_URL)
  if (typeof strings === 'string') {
    return db.query(strings, values[0] || [])
  }
  let query = ''
  const params = []
  for (let i = 0; i < values.length; i++) {
    query += strings[i] + '$' + (i + 1)
    params.push(values[i])
  }
  query += strings[strings.length - 1]
  return db.query(query, params)
}

function sqlWrite(strings, ...values) {
  const db = neon(DATABASE_URL_UNPOOLED)
  if (typeof strings === 'string') {
    return db.query(strings, values[0] || [])
  }
  let query = ''
  const params = []
  for (let i = 0; i < values.length; i++) {
    query += strings[i] + '$' + (i + 1)
    params.push(values[i])
  }
  query += strings[strings.length - 1]
  return db.query(query, params)
}

// Expose raw query for DDL statements
sql.query = (q, params) => neon(DATABASE_URL).query(q, params || [])
sqlWrite.query = (q, params) => neon(DATABASE_URL_UNPOOLED).query(q, params || [])

async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS resume (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT '',
      title VARCHAR(255) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      phone VARCHAR(64) NOT NULL DEFAULT '',
      summary TEXT NOT NULL,
      skills JSONB NOT NULL DEFAULT '[]',
      experience JSONB NOT NULL DEFAULT '[]',
      education JSONB NOT NULL DEFAULT '[]',
      "resumeFileName" VARCHAR(255) DEFAULT NULL,
      "resumeFileData" TEXT DEFAULT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]',
      image TEXT NOT NULL DEFAULT '',
      link VARCHAR(512) DEFAULT NULL,
      github VARCHAR(512) DEFAULT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      content TEXT NOT NULL DEFAULT '',
      "contentFileName" VARCHAR(255) DEFAULT NULL,
      "contentFileData" TEXT DEFAULT NULL
    )
  `

  // Migrate missing columns for older databases
  const hasColumn = async (table, col) => {
    const r = await sql`SELECT column_name FROM information_schema.columns WHERE table_name=${table} AND column_name=${col}`
    return r.length > 0
  }

  if (!(await hasColumn('resume', 'experience'))) {
    await sql.query("ALTER TABLE resume ADD COLUMN experience JSONB NOT NULL DEFAULT '[]'", [])
  }
  if (!(await hasColumn('resume', 'education'))) {
    await sql.query("ALTER TABLE resume ADD COLUMN education JSONB NOT NULL DEFAULT '[]'", [])
  }
  if (!(await hasColumn('projects', 'sort_order'))) {
    await sql.query('ALTER TABLE projects ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0', [])
  }
  if (!(await hasColumn('projects', 'content'))) {
    await sql.query("ALTER TABLE projects ADD COLUMN content TEXT NOT NULL DEFAULT ''", [])
  }
  if (!(await hasColumn('projects', 'contentFileName'))) {
    await sql.query('ALTER TABLE projects ADD COLUMN "contentFileName" VARCHAR(255) DEFAULT NULL', [])
  }
  if (!(await hasColumn('projects', 'contentFileData'))) {
    await sql.query('ALTER TABLE projects ADD COLUMN "contentFileData" TEXT DEFAULT NULL', [])
  }

  const resumeRows = await sql`SELECT id FROM resume LIMIT 1`
  if (resumeRows.length === 0) {
    await sql(
      `INSERT INTO resume (name, title, email, phone, summary, skills, experience, education) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        '古卡鲁', 'AI 应用探索者', 'aalenkai@163.com', '15307299123',
        'VibeCoding 践行者，热衷于用 AI 加速创意落地，专注将大模型能力转化为实用的产品体验。',
        JSON.stringify([
          { name: 'Python', show: true }, { name: 'LangChain', show: true },
          { name: 'React', show: true }, { name: 'TypeScript', show: true },
          { name: 'AI Agents', show: true }, { name: 'RAG', show: true },
          { name: 'Prompt Engineering', show: true }, { name: 'FastAPI', show: true },
        ]),
        JSON.stringify([]),
        JSON.stringify([]),
      ],
    )
  }

  const projRows = await sql`SELECT COUNT(*)::int as c FROM projects`
  if (projRows[0].c === 0) {
    const defaults = [
      { id: '1', title: 'Project Alpha', description: '一个基于 React 和 Node.js 的全栈项目，实现了实时数据可视化和协作编辑功能。', tags: ['React', 'Node.js', 'WebSocket', 'PostgreSQL'], image: '', link: 'https://example.com', github: 'https://github.com', sort_order: 0, content: '' },
      { id: '2', title: 'Project Beta', description: '使用 TypeScript 开发的命令行工具，用于自动化工作流和项目脚手架搭建。', tags: ['TypeScript', 'CLI', 'Node.js'], image: '', link: 'https://example.com', github: 'https://github.com', sort_order: 1, content: '' },
      { id: '3', title: 'Project Gamma', description: '移动端优先的天气预报应用，集成多个数据源，支持离线缓存和推送通知。', tags: ['React Native', 'TypeScript', 'Redis', 'Docker'], image: '', link: 'https://example.com', sort_order: 2, content: '' },
      { id: '4', title: 'Project Delta', description: '高性能 API 网关，支持限流、熔断、服务发现和分布式追踪。', tags: ['Go', 'gRPC', 'Kubernetes', 'Prometheus'], image: '', github: 'https://github.com', sort_order: 3, content: '' },
    ]
    for (const p of defaults) {
      await sql(
        'INSERT INTO projects (id, title, description, tags, image, link, github, sort_order, content, "contentFileName", "contentFileData") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [p.id, p.title, p.description, JSON.stringify(p.tags), p.image, p.link || null, p.github || null, p.sort_order, p.content, null, null],
      )
    }
  }

  console.log('Database initialized')
}

function formatRow(row) {
  if (!row) return null
  const obj = { ...row }
  if (typeof obj.skills === 'string') obj.skills = JSON.parse(obj.skills)
  if (typeof obj.experience === 'string') obj.experience = JSON.parse(obj.experience)
  if (typeof obj.education === 'string') obj.education = JSON.parse(obj.education)
  if (typeof obj.tags === 'string') obj.tags = JSON.parse(obj.tags)
  return obj
}

function auth(req, res, next) {
  const token = req.headers.authorization
  if (token !== `Bearer ${process.env.ADMIN_PASSWORD || 'gukalu123'}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

export async function createApp() {
  await initDb()

  const app = express()
  app.use(express.json({ limit: '50mb' }))

  // Prevent CDN/browser caching of API responses
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store, max-age=0')
    next()
  })

  // Normalize URL prefix — Vercel rewrites strip /api, local server keeps it
  app.use((req, _res, next) => {
    if (!req.url.startsWith('/api')) {
      req.url = '/api' + req.url
    }
    next()
  })

  // Resume API
  app.get('/api/resume', async (_req, res) => {
    const rows = await sql`SELECT * FROM resume ORDER BY id LIMIT 1`
    res.json(rows.length ? formatRow(rows[0]) : null)
  })

  app.put('/api/resume', auth, async (req, res) => {
    const r = req.body
    await sql(
      `UPDATE resume SET name=$1, title=$2, email=$3, phone=$4, summary=$5, skills=$6, experience=$7, education=$8, "resumeFileName"=$9, "resumeFileData"=$10 WHERE id=1`,
      [r.name || '', r.title || '', r.email || '', r.phone || '',
       r.summary || '', JSON.stringify(r.skills || []),
       JSON.stringify(r.experience || []), JSON.stringify(r.education || []),
       r.resumeFileName || null, r.resumeFileData || null],
    )
    res.json({ ok: true })
  })

  // Projects API
  app.get('/api/projects', async (_req, res) => {
    const rows = await sql`SELECT * FROM projects ORDER BY sort_order ASC, id ASC`
    res.json(rows.map(formatRow))
  })

  app.post('/api/projects', auth, async (req, res) => {
    try {
      const p = req.body
      console.log('POST /api/projects — image size:', (p.image || '').length, 'bytes')
      const maxRows = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM projects`
      const nextOrder = p.sort_order ?? maxRows[0].next_order
      await sqlWrite(
        'INSERT INTO projects (id, title, description, tags, image, link, github, sort_order, content, "contentFileName", "contentFileData") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [p.id, p.title, p.description, JSON.stringify(p.tags || []), p.image || '', p.link || null, p.github || null, nextOrder, p.content || '', p.contentFileName || null, p.contentFileData || null],
      )
      res.json({ ok: true })
    } catch (err) {
      console.error('POST /api/projects error:', err.message || err)
      res.status(500).json({ error: 'Database write failed', detail: err.message })
    }
  })

  app.put('/api/projects/:id', auth, async (req, res) => {
    try {
      const p = req.body
      console.log('PUT /api/projects/' + req.params.id + ' — image size:', (p.image || '').length, 'bytes')
      await sqlWrite(
        'UPDATE projects SET title=$1, description=$2, tags=$3, image=$4, link=$5, github=$6, sort_order=$7, content=$8, "contentFileName"=$9, "contentFileData"=$10 WHERE id=$11',
        [p.title, p.description, JSON.stringify(p.tags || []), p.image || '', p.link || null, p.github || null, p.sort_order ?? 0, p.content || '', p.contentFileName || null, p.contentFileData || null, req.params.id],
      )
      res.json({ ok: true })
    } catch (err) {
      console.error('PUT /api/projects error:', err.message || err)
      res.status(500).json({ error: 'Database update failed', detail: err.message })
    }
  })

  app.delete('/api/projects/:id', auth, async (req, res) => {
    await sql`DELETE FROM projects WHERE id = ${req.params.id}`
    res.json({ ok: true })
  })

  app.put('/api/projects/reorder', auth, async (req, res) => {
    const { orderedIds } = req.body
    if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'orderedIds required' })
    for (let i = 0; i < orderedIds.length; i++) {
      await sql`UPDATE projects SET sort_order=${i} WHERE id=${orderedIds[i]}`
    }
    res.json({ ok: true })
  })

  return app
}

// ─── Local dev server ───
const __dirname = dirname(fileURLToPath(import.meta.url))
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) {
  const PORT = process.env.PORT || 3001
  const app = await createApp()

  const dist = join(__dirname, 'dist')
  if (existsSync(dist)) {
    app.use(express.static(dist))
    app.use((_req, res) => {
      res.sendFile(join(dist, 'index.html'))
    })
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}
