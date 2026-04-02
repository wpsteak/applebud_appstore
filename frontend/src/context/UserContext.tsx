import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { api, setUserEmail } from '../api/client'
import type { CurrentUser } from '../api/types'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

interface UserContextValue {
  user: CurrentUser | null
  loading: boolean
  loginError: string
  showButton: boolean
  buttonRef: React.RefObject<HTMLDivElement | null>
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  loginError: '',
  showButton: false,
  buttonRef: { current: null },
})

const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === 'true'
const DEV_EMAIL = import.meta.env.VITE_DEV_EMAIL as string

let gsiInitialized = false

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [showButton, setShowButton] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleCredential = async (response: { credential: string }) => {
    try {
      const base64url = response.credential.split('.')[1]
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64url.length / 4) * 4, '=')
      const payload = JSON.parse(atob(base64))
      setUserEmail(payload.email)
      const me = await api.getMe()
      setUser(me)
      setLoginError('')
      setShowButton(false)
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : '登入失敗，請確認使用公司帳號')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (SKIP_AUTH) {
      setUserEmail(DEV_EMAIL)
      setUser({ email: DEV_EMAIL, name: DEV_EMAIL.split('@')[0], isAdmin: true, domain: 'orangeapple.co' })
      setLoading(false)
      return
    }

    if (gsiInitialized) return
    gsiInitialized = true

    const tryInit = () => {
      const google = (window as any).google
      if (!google) { setTimeout(tryInit, 200); return }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: true,
        use_fedcm_for_prompt: true,
      })

      google.accounts.id.prompt((notification: any) => {
        const skipped = notification.getSkippedReason?.() || notification.getDismissedReason?.()
        const notDisplayed = notification.getNotDisplayedReason?.()
        if (skipped || notDisplayed) {
          setLoading(false)
          setShowButton(true)
        }
      })
    }

    tryInit()
  }, [])

  // buttonRef 有值之後才 renderButton
  useEffect(() => {
    if (!showButton || !buttonRef.current) return
    const google = (window as any).google
    if (!google) return
    google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'zh-TW',
    })
  }, [showButton])

  return (
    <UserContext.Provider value={{ user, loading, loginError, showButton, buttonRef }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
