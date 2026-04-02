import { Link } from 'react-router-dom'
import type { Post } from '../api/types'
import { useUser } from '../context/UserContext'
import { api } from '../api/client'
import { useState } from 'react'

interface Props {
  post: Post
  onUpdate?: () => void
  showAdmin?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  tool: 'bg-blue-100 text-blue-700',
  skill: 'bg-green-100 text-green-700',
  prompt: 'bg-orange-100 text-orange-700',
  gem: 'bg-pink-100 text-pink-700',
  case: 'bg-gray-100 text-gray-700',
}

export default function PostCard({ post, onUpdate, showAdmin = false }: Props) {
  const { user } = useUser()
  const [acting, setActing] = useState(false)

  const colorClass = CATEGORY_COLORS[post.categoryKey] ?? 'bg-gray-100 text-gray-700'

  async function handleFeature() {
    setActing(true)
    try {
      if (post.isFeatured) await api.unfeaturePost(post.id)
      else await api.featurePost(post.id)
      onUpdate?.()
    } finally {
      setActing(false)
    }
  }

  async function handleArchive() {
    if (!confirm('確定要下架這篇貼文？')) return
    setActing(true)
    try {
      await api.archivePost(post.id)
      onUpdate?.()
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
            {post.categoryName}
          </span>
          {post.isFeatured && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              ⭐ 精選
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 shrink-0">👁 {post.viewCount}</span>
      </div>

      <Link to={`/posts/${post.id}`} className="group">
        <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2 mb-1">
          {post.title}
        </h3>
      </Link>

      {post.summary && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.summary}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {post.authorEmail.split('@')[0]} · {new Date(post.publishedAt).toLocaleDateString('zh-TW')}
        </span>

        {showAdmin && user?.isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleFeature}
              disabled={acting}
              className="text-xs text-gray-500 hover:text-yellow-600 transition-colors"
            >
              {post.isFeatured ? '取消精選' : '設為精選'}
            </button>
            <button
              onClick={handleArchive}
              disabled={acting}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              下架
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
