export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  image: string
  link?: string
  github?: string
  sort_order: number
  content: string
  contentFileName?: string
  contentFileData?: string
}
