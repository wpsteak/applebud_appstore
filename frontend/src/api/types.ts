export interface Post {
  id: string
  title: string
  summary: string
  content: string
  categoryKey: string
  categoryName: string
  authorEmail: string
  authorName: string
  status: 'published' | 'archived'
  isFeatured: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface Category {
  key: string
  name: string
  sortOrder: number
  isActive: boolean
}

export interface CurrentUser {
  email: string
  name: string
  isAdmin: boolean
  domain: string
}

export interface HomeData {
  featured: Post[]
  latest: Post[]
  top: Post[]
}

export interface PostsData {
  items: Post[]
  pagination: { page: number; pageSize: number; total: number }
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}
