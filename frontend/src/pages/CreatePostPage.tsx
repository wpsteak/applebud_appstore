import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Category } from '../api/types'

export default function CreatePostPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ title: '', summary: '', content: '', categoryKey: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCategories().then(cats => {
      setCategories(cats)
      if (cats.length > 0) setForm(f => ({ ...f, categoryKey: cats[0].key }))
    })
  }, [])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.categoryKey) {
      setError('標題、內文和分類為必填')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { id } = await api.createPost({
        title: form.title.trim(),
        summary: form.summary.trim() || undefined,
        content: form.content.trim(),
        categoryKey: form.categoryKey,
      })
      navigate(`/posts/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發文失敗，請再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">發佈貼文</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分類 *</label>
          <select
            value={form.categoryKey}
            onChange={e => set('categoryKey', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {categories.map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="一句話說明這篇的核心"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
          <input
            type="text"
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
            placeholder="簡短描述，讓人一眼看懂（選填）"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">內文 *</label>
          <textarea
            value={form.content}
            onChange={e => set('content', e.target.value)}
            placeholder="詳細說明、步驟、連結…"
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-y"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '發佈中…' : '發佈'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
