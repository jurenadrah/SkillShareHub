'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Uporabnik = {
  id: number
  ime: string
  priimek: string
  email: string
  bio: string | null
  profilna_slika: string | null
  tutor: boolean
}

export default function StudentProfile() {
  const [uporabnik, setUporabnik] = useState<Uporabnik | null>(null)
  const [loading, setLoading] = useState(true)

  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [profilnaSlika, setProfilnaSlika] = useState('')
  const [editMode, setEditMode] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('Uporabniki')
        .select('id, ime, priimek, email, bio, profilna_slika, tutor')
        .eq('email', user.email)
        .single()

      if (error) {
        setError('Napaka pri nalaganju profila.')
      } else if (data) {
        setUporabnik(data)
        setEmail(data.email)
        setBio(data.bio ?? '')
        setProfilnaSlika(data.profilna_slika ?? '')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const updateProfile = async () => {
    setError(null)
    setSuccess(null)

    if (!uporabnik) return

    if (!validateEmail(email)) {
      setError('Prosimo vnesi veljaven email.')
      return
    }

    if (email !== uporabnik.email) {
      const { error: authError } = await supabase.auth.updateUser({ email })
      if (authError) {
        setError('Napaka pri posodabljanju e-pošte: ' + authError.message)
        return
      }
    }

    const { error } = await supabase
      .from('Uporabniki')
      .update({ email, bio, profilna_slika: profilnaSlika })
      .eq('id', uporabnik.id)

    if (error) {
      setError('Napaka pri posodabljanju profila: ' + error.message)
    } else {
      setSuccess('Profil uspešno posodobljen!')
      setUporabnik({ ...uporabnik, email, bio, profilna_slika: profilnaSlika })
      setEditMode(false)
    }
  }

  if (loading) return <p>Nalaganje...</p>
  if (!uporabnik) return <p>Uporabnik ni prijavljen.</p>

  return (
    <div className="p-6 max-w-3xl mx-auto bg-[#fdf6e3] rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Profil učenca</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <div className="relative grid grid-cols-2 gap-4 items-start">
        {/* Leva stran (email & bio) */}
        <div>
          {/* Email */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Email:</label>
            {editMode ? (
              <input
                type="email"
                className="w-full border rounded p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <p className="text-gray-800">{email}</p>
            )}
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Bio:</label>
            {editMode ? (
              <textarea
                className="w-full border rounded p-2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{bio || 'Ni opisa.'}</p>
            )}
          </div>
        </div>

        {/* Desna stran (profilna slika + vnos URL-ja če je editMode) */}
        <div className="flex flex-col items-center">
          {profilnaSlika ? (
            <img
              src={profilnaSlika}
              alt="Profilna slika"
              className="w-32 h-32 object-cover rounded-full mb-2"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center mb-2 text-gray-600">
              Ni slike
            </div>
          )}
          {editMode && (
            <input
              type="text"
              placeholder="URL slike"
              value={profilnaSlika}
              onChange={(e) => setProfilnaSlika(e.target.value)}
              className="w-full border rounded p-2 mt-2"
            />
          )}
        </div>
      </div>

      {/* Gumbi */}
      <div className="mt-6 flex gap-4">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Uredi profil
          </button>
        ) : (
          <>
            <button
              onClick={updateProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Shrani spremembe
            </button>
            <button
              onClick={() => {
                setEditMode(false)
                setEmail(uporabnik.email)
                setBio(uporabnik.bio ?? '')
                setProfilnaSlika(uporabnik.profilna_slika ?? '')
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Prekliči
            </button>
          </>
        )}
      </div>
    </div>
  )
}
