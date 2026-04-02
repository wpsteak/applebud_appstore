import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import CreatePostPage from './pages/CreatePostPage'
import EditPostPage from './pages/EditPostPage'
import MyPostsPage from './pages/MyPostsPage'

function AppContent() {
  const { user, loading, loginError, buttonRef } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">登入中…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 mb-2">🍎 App Store</p>
          <p className="text-sm text-gray-500 mb-6">請使用 @orangeapple.co 帳號登入</p>
          {loginError && <p className="text-sm text-red-500 mb-4">{loginError}</p>}
          <div ref={buttonRef} className="flex justify-center" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/posts/:id/edit" element={<EditPostPage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  )
}
