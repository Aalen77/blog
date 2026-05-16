import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import type { Project } from '../data/projects'

const gradientBgs = [
  'from-purple-600 to-blue-500',
  'from-pink-500 to-orange-400',
  'from-teal-400 to-cyan-500',
  'from-rose-500 to-purple-600',
]

function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  return (
    <Link
      to={`/project/${project.id}`}
      className="group block rounded-2xl border border-white/10 bg-white/5 transition-all hover:-translate-y-1 hover:border-purple-500/50"
    >
      <div className="aspect-video overflow-hidden rounded-t-2xl">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`flex size-full items-center justify-center bg-gradient-to-br ${gradientBgs[index % gradientBgs.length]}`}
          >
            <span className="text-4xl font-bold text-white/30 md:text-5xl">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-xl font-semibold text-white group-hover:text-purple-400">
          {project.title}
        </h3>
        <p className="leading-relaxed text-gray-400">{project.description}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function Projects() {
  const { projects } = useStore()

  return (
    <section id="projects" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            项目展示
          </h2>
          <p className="mt-4 text-gray-400">一些我参与和开发的项目</p>
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500">暂无项目</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Projects
