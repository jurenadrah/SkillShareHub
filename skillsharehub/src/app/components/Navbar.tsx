'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthForm from './AuthForm'
import { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const handleHomeClick = () => router.push('/')
  const handleProfileClick = () => user && router.push('/profil')
  const handlePostsClick = () => router.push('/posts')
  const handleDmsClick = () => router.push('/dms')

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev)

return (
  <>
    <nav className="bg-[#1e1e1e] shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section: logo + links */}
        <div className="flex items-center space-x-6">
          <button
            onClick={handleHomeClick}
            className="h-16 hover:opacity-80 transition-opacity"
            type="button"
          >
            <img src="/logo.png" alt="Logo" className="h-full w-auto" />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-4 text-white">
            <a href="/about" className="hover:underline">O SKILLSHAREHUB-U</a>
            {user ? (
              <>
                <button onClick={handleProfileClick} className="hover:underline">MOJ PROFIL</button>
                <button onClick={handlePostsClick} className="hover:underline">OBJAVE</button>
                <button onClick={handleDmsClick} className="hover:underline">SPOROČILA</button>
              </>
            ) : (
              <>
                <span className="text-gray-400">MOJ PROFIL</span>
                <span className="text-gray-400">OBJAVE</span>
                <span className="text-gray-400">SPOROČILA</span>
              </>
            )}
          </div>
        </div>

        {/* Right section: auth controls and mobile toggle */}
        <div className="flex items-center space-x-4 text-white">
          {/* Desktop auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-300">POZDRAVLJEN/A, {user.email}</span>
                <button
                  onClick={signOut}
                  className="px-3 py-1 bg-orange-200 text-black rounded hover:bg-orange-300 transition"
                >
                  ODJAVA
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
              >
                PRIJAVA / REGISTRACIJA
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white text-3xl"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-2 text-white">
          <a href="/about" className="hover:underline">O SKILLSHAREHUB-U</a>
          {user ? (
            <>
              <button onClick={handleProfileClick}>MOJ PROFIL</button>
              <button onClick={handlePostsClick}>OBJAVE</button>
              <button onClick={handleDmsClick}>SPOROČILA</button>
              <span className="text-sm text-gray-300">POZDRAVLJEN/A, {user.email}</span>
              <button
                onClick={signOut}
                className="px-3 py-1 bg-orange-200 text-black rounded hover:bg-orange-300 transition"
              >
                ODJAVA
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-400">MOJ PROFIL</span>
              <span className="text-gray-400">OBJAVE</span>
              <span className="text-gray-400">SPOROČILA</span>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
              >
                PRIJAVA / REGISTRACIJA
              </button>
            </>
          )}
        </div>
      )}
    </nav>

    {/* Auth Modal */}
    {showAuthModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75">
        <div className="relative w-full max-w-md mx-auto">
          <div className="bg-white rounded shadow-lg p-6 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600"
              title="Zapri"
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
