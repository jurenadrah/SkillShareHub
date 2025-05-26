'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthForm from './AuthForm'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setShowAuthModal(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  const handleProfileClick = async () => {
    if (!user) return
    console.log("USER:", user)
    console.log("USER ID:", user.id)
    console.log("USER EMAIL:", user.email)
    
    const { data, error } = await supabase
    .from('Uporabniki')
    .select('tutor')
    .eq('email', user.email)
    .maybeSingle()
  

    if (error || !data) {
      console.error('Napaka pri pridobivanju podatkov:', error)
      return
    }

    router.push(data.tutor ? '/tutor' : '/student')

  }

  const handlePostsClick = async () => {
    router.push('/posts')
  }
  const handledmsClick = async () => {
    router.push('/dms')
  }

  return (
    <>
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="flex items-center space-x-6">
          <a href="#" className="text-gray-700 hover:underline">About</a>
          {user ? (
            <button
              onClick={handleProfileClick}
              className="text-blue-600 hover:underline"
              type="button"
            >
              Moj profil
            </button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">Moj profil</span>
          )}
          {user ? (
            <button
              onClick={handlePostsClick}
              className="text-blue-600 hover:underline"
              type="button"
            >
              Posti
            </button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">Posti</span>
          )}
          {user ? (
            <button
              onClick={handledmsClick}
              className="text-blue-600 hover:underline"
              type="button"
            >
              Msg
            </button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">Msg</span>
          )}
          <a href="#" className="text-gray-700 hover:underline">Online Courses</a>
          <a href="#" className="text-gray-700 hover:underline">Contact</a>
        </div>

        <button 
          onClick={handleHomeClick}
          className="text-xl font-bold text-center hover:text-indigo-600 transition-colors cursor-pointer"
          type="button"
        >
          📷 SkillShareHub
        </button>

        <div className="flex space-x-4 items-center">
          <span>🔔</span>
          <span>👤</span>
          <span>📘</span>
          <span>🐦</span>
          <span>▶️</span>
          {user ? (
            <>
              <span className="text-sm text-gray-700 ml-2">
                Pozdravljen, {user.email}
              </span>
              <button
                onClick={signOut}
                className="ml-2 px-3 py-1 bg-orange-200 rounded hover:bg-orange-300 transition"
                type="button"
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                type="button"
              >
                Prijava / Registracija
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Modal za prijavo/registracijo */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75">
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-white rounded shadow-lg p-6 relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600"
                title="Zapri"
                type="button"
              >
                ×
              </button>
              <AuthForm />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
