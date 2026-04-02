import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function Nav() {
  const { user } = useUser()
  const { pathname } = useLocation()

  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        pathname === to
          ? 'bg-violet-100 text-violet-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-gray-900 text-base">
          🍎 App Store
        </Link>

        <div className="flex items-center gap-1">
          {link('/', '首頁')}
          {user && link('/my-posts', '我的貼文')}
          {user && link('/create', '+ 發文')}
        </div>

        <div className="text-sm text-gray-500">
          {user ? user.email.split('@')[0] : '載入中…'}
          {user?.isAdmin && <span className="ml-1 text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">管理者</span>}
        </div>
      </div>
    </nav>
  )
}
