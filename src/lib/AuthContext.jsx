import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkAdmin(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        checkAdmin(session.user.id)
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error)
    }
  }

  const checkAdmin = async (userId) => {
    try {
      const { data } = await supabase
        .from('utilizadores')
        .select('tipo')
        .eq('id', userId)
        .single()
      setIsAdmin(data?.tipo === 'admin')
    } catch (error) {
      setIsAdmin(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
