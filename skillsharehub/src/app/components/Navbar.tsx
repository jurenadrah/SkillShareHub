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

    router.push('/profil')

  }

  const handlePostsClick = async () => {
    router.push('/posts')
  }
  const handledmsClick = async () => {
    router.push('/dms')
  }

  return (
    <>
      <nav className="flex justify-between items-center px-6 py-4 bg-[#1e1e1e] shadow-md">
        <div className="flex items-center space-x-6">
         <button 
  onClick={handleHomeClick}
  className="h-20 hover:opacity-80 transition-opacity cursor-pointer"
  type="button"
>
  <img 
    src="/logo.png" 
    alt="SkillShareHub Logo"
    className="h-full w-auto" 
  />
</button>
     {user ? (
            <button
              onClick={handleProfileClick}
              className="text-blue-600 hover:underline"
              type="button"
            >
                        <a href="/about" className="text-gray-700 hover:underline">O SKILLSHAREHUB-U</a>

            </button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">O SKILLSHAREHUB-U</span>
          )}
          {user ? (
            <button
              onClick={handleProfileClick}
              className="text-blue-600 hover:underline"
              type="button"
            >
              MOJ PROFIL
            </button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">MOJ PROFIL</span>
          )}
          {user ? (
            <button
              onClick={handlePostsClick}
              className="text-blue-600 hover:underline"
              type="button"
            >
              OBJAVE
            </button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">OBJAVE</span>
          )}
          {user ? (
            <button
              onClick={handledmsClick}
              className="text-blue-600 hover:underline"
              type="button"
            >
              SPOROČILA
            </button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">SPOROČILA</span>
          )}
        </div>

        <div className="flex space-x-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-700 ml-2">
                POZDRAVLJEN/A, {user.email}
              </span>
              <button
                onClick={signOut}
                className="ml-2 px-3 py-1 bg-orange-200 rounded hover:bg-orange-300 transition"
                type="button"
              >
                ODJAVA
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                type="button"
              >
                PRIJAVA / REGISTRACIJA
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
