'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthForm from './AuthForm'
import { AnimatePresence, motion } from 'framer-motion'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const initialCheckDone = useRef(false)
  const previousUser = useRef<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      previousUser.current = data.user
      initialCheckDone.current = true
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)

      // 🚀 Refresh if user logs in or logs out (not during silent token refreshes)
      if (initialCheckDone.current) {
        const wasLoggedIn = previousUser.current !== null
        const isLoggedIn = newUser !== null

        if (wasLoggedIn !== isLoggedIn) {
          previousUser.current = newUser
          window.location.reload()
        }
      }

      previousUser.current = newUser
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setShowAuthModal(false)
    }

  const handleHomeClick = () => {
    router.push('/')
  }

  const handleProfileClick = async () => {
    if (!user) return

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
      {/* Navbar */}
      <nav className="relative px-6 py-4 bg-white shadow-md flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <a href="#" className="text-gray-700 hover:underline">About</a>
          <a className="text-blue-600 hover:underline" href='/'>Home</a>
          {user ? (
            <button onClick={handleProfileClick} className="text-blue-600 hover:underline">Moj profil</button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">Moj profil</span>
          )}
          {user ? (
            <button onClick={handlePostsClick} className="text-blue-600 hover:underline">Posti</button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">Posti</span>
          )}
          {user ? (
            <button onClick={handledmsClick} className="text-blue-600 hover:underline">Sporočila</button>
          ) : (
            <span className="text-gray-400 cursor-not-allowed">Sporočila</span>
          )}
        </div>

        {/* Centered Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleHomeClick}
            className="text-xl font-bold text-center hover:text-indigo-600 transition-colors cursor-pointer"
            type="button"
          >
            📷 SkillShareHub
          </button>
        </div>

        {/* Right Section */}
        <div className="flex space-x-4 items-center">
          <span>🔔</span>
          <span>👤</span>
          <span>📘</span>
          <span>🐦</span>
          <span>▶️</span>
          {user ? (
            <>
              <span className="text-sm text-gray-700 ml-2">Pozdravljen/a, {user.email}</span>
              <button
                onClick={signOut}
                className="ml-2 px-3 py-1 bg-orange-200 rounded hover:bg-orange-300 transition"
                type="button"
              >
                Odjava
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
              type="button"
            >
              Prijava / Registracija
            </button>
          )}
        </div>
      </nav>

      {/* Animated Modal for Auth */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="relative w-full max-w-md mx-auto bg-white rounded shadow-lg p-6"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600"
                title="Zapri"
                type="button"
              >
                ×
              </button>
              <AuthForm />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
