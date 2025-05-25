'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import MyEvents from '@/app/components/MyEvents'

type Uporabnik = {
  id: number
  ime: string
  priimek: string
  email: string
  bio: string | null
  profilna_slika: string | null
  tutor: boolean
}

type UserEvent = {
  id: number
  event_id: number
  google_calendar_event_id: string | null
  created_at: string
  event: {
    id: number
    title: string
    description: string
    start_date_time: string
    end_date_time: string
    lecturer: string
    predmet?: {
      naziv: string
    }
  }
}

export default function StudentProfile() {
  const [uporabnik, setUporabnik] = useState<Uporabnik | null>(null)
  const [loading, setLoading] = useState(true)
  const [googleLoading, setGoogleLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [profilnaSlika, setProfilnaSlika] = useState('')
  const [editMode, setEditMode] = useState(false)
  
  const [hasGoogleConnected, setHasGoogleConnected] = useState(false)
  const [showGoogleConnect, setShowGoogleConnect] = useState(false)

  // New states for user events
  const [userEvents, setUserEvents] = useState<UserEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Check if user has Google connected
      setHasGoogleConnected(user.app_metadata?.providers?.includes('google') || false)

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
        
        // Fetch user's events
        await fetchUserEvents(data.id)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const fetchUserEvents = async (userId: number) => {
    setEventsLoading(true)
    try {
      const { data, error } = await supabase
        .from('UserEvents')
        .select(`
          id,
          event_id,
          google_calendar_event_id,
          created_at,
          event:Event (
            id,
            title,
            description,
            start_date_time,
            end_date_time,
            lecturer,
            predmet:fk_id_predmet (
              naziv
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setUserEvents(
        (data || []).map((ue: any) => ({
          ...ue,
          event: ue.event && Array.isArray(ue.event) ? {
            ...ue.event[0],
            predmet: ue.event[0]?.predmet && Array.isArray(ue.event[0].predmet)
              ? ue.event[0].predmet[0]
              : ue.event[0]?.predmet
          } : ue.event
        }))
      )
    } catch (err) {
      console.error('Error fetching user events:', err)
      setError('Napaka pri nalaganju dogodkov.')
    } finally {
      setEventsLoading(false)
    }
  }

  const handleEventRemoved = (userEventId: number) => {
    setUserEvents(prev => prev.filter(ue => ue.id !== userEventId))
    setSuccess('Dogodek uspešno odstranjen iz koledarja!')
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000)
  }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uporabnik) return

    const fileExt = file.name.split('.').pop()
    const filePath = `profilne/${uporabnik.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase
      .storage
      .from('profilne-slike')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      setError('Napaka pri nalaganju slike: ' + uploadError.message)
      return
    }

    const { data } = supabase
      .storage
      .from('profilne-slike')
      .getPublicUrl(filePath)

    setProfilnaSlika(data.publicUrl)
  }

  const connectGoogleAccount = async () => {
    setGoogleLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/student`,
          scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
        }
      })
      
      if (error) {
        setError('Napaka pri povezavi Google računa: ' + error.message)
        setGoogleLoading(false)
      }
    } catch (e: any) {
      setError('Napaka: ' + e.message)
      setGoogleLoading(false)
    }
  }

  if (loading) return <p>Nalaganje...</p>
  if (!uporabnik) return <p>Uporabnik ni prijavljen.</p>

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#fdf6e3] rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Profil učenca</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Profile Info */}
        <div>
          <div className="relative grid grid-cols-2 gap-4 items-start">
            {/* Profile Details */}
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

              {/* Google account connection */}
              <div className="mt-4">
                <label className="block font-semibold mb-1">Povezani računi:</label>
                
                {hasGoogleConnected ? (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      className="h-4 w-4"
                    />
                    <span className="text-green-700">Google račun povezan</span>
                  </div>
                ) : (
                  <>
                    {!showGoogleConnect ? (
                      <button
                        onClick={() => setShowGoogleConnect(true)}
                        className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 text-sm"
                      >
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          alt="Google"
                          className="h-4 w-4"
                        />
                        <span>+ Poveži Google račun</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200 space-y-2">
                        <p className="text-sm text-blue-800">
                          Povezava Google računa bo omogočila dostop do Google Calendar funkcij.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={connectGoogleAccount}
                            disabled={googleLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            <img
                              src="https://www.svgrepo.com/show/475656/google-color.svg"
                              alt="Google"
                              className="h-4 w-4"
                            />
                            {googleLoading ? 'Povezujem...' : 'Poveži'}
                          </button>
                          <button
                            onClick={() => setShowGoogleConnect(false)}
                            className="px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                          >
                            Prekliči
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Profile Image */}
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
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full border rounded p-2 mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">Izberi sliko s svojega računalnika</p>
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
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

        {/* Right Column - My Events */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Moji dogodki</h2>
            
            {eventsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Nalaganje dogodkov...</p>
              </div>
            ) : (
              <MyEvents 
                userEvents={userEvents}
                onEventRemoved={handleEventRemoved}
                hasGoogleConnected={hasGoogleConnected}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}