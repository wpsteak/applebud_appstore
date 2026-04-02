import type { ApiResponse, Category, CurrentUser, HomeData, Post, PostsData } from './types'

const GAS_URL = import.meta.env.VITE_GAS_URL as string

let _email = ''
export function setUserEmail(email: string) { _email = email }

async function get<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(GAS_URL)
  url.searchParams.set('action', action)
  if (_email) url.searchParams.set('email', _email)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString())
  const json: ApiResponse<T> = await res.json()
  if (!json.success || json.data === null) throw new Error(json.error?.message ?? 'Unknown error')
  return json.data
}

async function post<T>(action: string, payload: unknown = {}): Promise<T> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, payload, email: _email }),
  })
  const json: ApiResponse<T> = await res.json()
  if (!json.success || json.data === null) throw new Error(json.error?.message ?? 'Unknown error')
  return json.data
}

export const api = {
  getMe: () => get<CurrentUser>('getMe'),

  getHome: () => get<HomeData>('getHome'),

  getCategories: () => get<Category[]>('getCategories'),

  getPosts: (params: { categoryKey?: string; authorEmail?: string; sort?: string; page?: number; pageSize?: number } = {}) => {
    const p: Record<string, string> = {}
    if (params.categoryKey) p.categoryKey = params.categoryKey
    if (params.authorEmail) p.authorEmail = params.authorEmail
    if (params.sort) p.sort = params.sort
    if (params.page) p.page = String(params.page)
    if (params.pageSize) p.pageSize = String(params.pageSize)
    return get<PostsData>('getPosts', p)
  },

  getPost: (id: string) => get<Post>('getPost', { id }),

  createPost: (payload: { title: string; summary?: string; content: string; categoryKey: string }) =>
    post<{ id: string }>('createPost', payload),

  updatePost: (payload: { id: string; title?: string; summary?: string; content?: string; categoryKey?: string }) =>
    post<{ id: string }>('updatePost', payload),

  deletePost: (id: string) => post<{ id: string }>('deletePost', { id }),

  incrementPostView: (id: string) => post<{ id: string; viewCount: number }>('incrementPostView', { id }),

  featurePost: (id: string) => post<{ id: string; isFeatured: boolean }>('featurePost', { id }),

  unfeaturePost: (id: string) => post<{ id: string; isFeatured: boolean }>('unfeaturePost', { id }),

  archivePost: (id: string) => post<{ id: string; status: string }>('archivePost', { id }),
}
