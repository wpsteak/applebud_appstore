import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Post } from '../api/types'
import { useUser } from '../context/UserContext'

export default function MyPostsPage() {
  const { user } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    if (!user) return
    api.getPosts({ authorEmail: user.email, pageSize: 100 })
      .then(d => setPosts(d.items))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [user])

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除這篇貼文？')) return
    await api.deletePost(id)
    load()
  }

  if (loading) return <div className="text-center py-20 text-gray-400">載入中…</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">我的貼文</h1>
        <Link
          to="/create"
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          + 發文
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">還沒有貼文</p>
          <Link to="/create" className="text-violet-600 hover:underline text-sm">發佈第一篇</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {post.categoryName}
                    </span>
                    {post.isFeatured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">⭐ 精選</span>
                    )}
                    {post.status === 'archived' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">已下架</span>
                    )}
                  </div>
                  <Link to={`/posts/${post.id}`} className="font-medium text-gray-900 hover:text-violet-600 transition-colors line-clamp-1">
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(post.publishedAt).toLocaleDateString('zh-TW')} · 👁 {post.viewCount}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link
                    to={`/posts/${post.id}/edit`}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    編輯
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
