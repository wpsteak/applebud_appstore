import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Category, HomeData } from '../api/types'
import PostCard from '../components/PostCard'

export default function HomePage() {

  const [home, setHome] = useState<HomeData | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [posts, setPosts] = useState<ReturnType<typeof api.getPosts> extends Promise<infer T> ? T : never>()
  const [loading, setLoading] = useState(true)

  function loadHome() {
    return api.getHome().then(setHome)
  }

  useEffect(() => {
    Promise.all([loadHome(), api.getCategories().then(setCategories)])
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.getPosts({ categoryKey: selectedCategory || undefined, sort: 'latest', pageSize: 30 })
      .then(setPosts)
  }, [selectedCategory])

  if (loading) return <div className="text-center py-20 text-gray-400">載入中…</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* 精選 */}
      {home && home.featured.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">⭐ 精選</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {home.featured.map(p => (
              <PostCard key={p.id} post={p} onUpdate={loadHome} showAdmin />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 左側主欄 */}
        <div className="lg:col-span-2">

          {/* 分類篩選 */}
          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === '' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === c.key ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {posts?.items.map(p => (
              <PostCard key={p.id} post={p} showAdmin />
            ))}
            {posts?.items.length === 0 && (
              <p className="text-gray-400 text-sm py-8 text-center">這個分類還沒有貼文</p>
            )}
          </div>
        </div>

        {/* 右側排行 */}
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">🔥 總排行</h2>
            <div className="flex flex-col gap-2">
              {home?.top.slice(0, 10).map((p, i) => (
                <div key={p.id} className="flex items-start gap-2">
                  <span className={`text-sm font-bold w-5 shrink-0 ${i < 3 ? 'text-violet-500' : 'text-gray-400'}`}>
                    {i + 1}
                  </span>
                  <div>
                    <a href={`/posts/${p.id}`} className="text-sm text-gray-800 hover:text-violet-600 line-clamp-2">
                      {p.title}
                    </a>
                    <span className="text-xs text-gray-400">👁 {p.viewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">🆕 最新張貼</h2>
            <div className="flex flex-col gap-2">
              {home?.latest.slice(0, 10).map(p => (
                <div key={p.id}>
                  <a href={`/posts/${p.id}`} className="text-sm text-gray-800 hover:text-violet-600 line-clamp-2">
                    {p.title}
                  </a>
                  <span className="text-xs text-gray-400">
                    {p.authorEmail.split('@')[0]} · {new Date(p.publishedAt).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
