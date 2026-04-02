import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Post } from '../api/types'
import { useUser } from '../context/UserContext'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useUser()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    api.getPost(id)
      .then(p => {
        setPost(p)
        api.incrementPostView(id).catch(() => {})
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleDelete() {
    if (!post || !confirm('確定要刪除這篇貼文？')) return
    setDeleting(true)
    try {
      await api.deletePost(post.id)
      navigate('/')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">載入中…</div>
  if (!post) return null

  const isAuthor = user?.email === post.authorEmail

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← 返回首頁</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
            {post.categoryName}
          </span>
          {post.isFeatured && (
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">⭐ 精選</span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>

        {post.summary && (
          <p className="text-gray-500 mb-4 text-base">{post.summary}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-400 mb-6 pb-4 border-b border-gray-100">
          <span>{post.authorEmail.split('@')[0]} · {new Date(post.publishedAt).toLocaleDateString('zh-TW')}</span>
          <span>👁 {post.viewCount}</span>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>

        {isAuthor && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <Link
              to={`/posts/${post.id}/edit`}
              className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              編輯
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              {deleting ? '刪除中…' : '刪除'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
