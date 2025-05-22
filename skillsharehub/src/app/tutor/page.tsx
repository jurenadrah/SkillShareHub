'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import './tutor.css'

type Tutor = {
  id: number
  ime: string
  priimek: string
  email: string
  bio: string | null
  profilna_slika: string | null
  tutor: boolean
  zoom_link: string | null
}

type Ocena = {
  komentar: string
  tocke: number
  ucenec_email: string
}

type Predmet = {
  id: number
  naziv: string
  fk_tipPredmeta_id: number | null
}

type TipPredmeta = {
  id: number
  naziv: string
}

type TutorPredmet = {
  fk_Uporabniki: number
  fk_Predmeti: number
}

type Event = {
  id?: number
  fk_id_uporabnik: number
  fk_id_predmet: number
  title: string
  description: string
  day_of_week: string
  start_date_time: string
  end_date_time: string
}

export default function TutorProfile() {
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [predmetiEditMode, setPredmetiEditMode] = useState(false)
  const [urnikEditMode, setUrnikEditMode] = useState(false)

  // Profilne spremenljivke
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [profilnaSlika, setProfilnaSlika] = useState('')

  // Predmeti
  const [predmeti, setPredmeti] = useState<Predmet[]>([])
  const [tipiPredmetov, setTipiPredmetov] = useState<TipPredmeta[]>([])
  const [izbraniPredmeti, setIzbraniPredmeti] = useState<number[]>([])
  const [novPredmetNaziv, setNovPredmetNaziv] = useState('')
  const [novPredmetTip, setNovPredmetTip] = useState<number | null>(null)
  const [novlistmojihpredmetov, setnovlistmojihpredmetov]=useState<string | null>(null)

  // Urnik
  const [dogodki, setDogodki] = useState<Event[]>([])
  const [novDogodek, setNovDogodek] = useState<Event>({
    fk_id_predmet: NaN,
    fk_id_uporabnik: NaN,
    title: '',
    description: '',
    day_of_week: 'Ponedeljek',
    start_date_time: '',
    end_date_time: ''
  })

  const [ocene, setOcene] = useState<Ocena[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchTutor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data, error } = await supabase
        .from('Uporabniki')
        .select('id, ime, priimek, email, bio, profilna_slika, tutor, zoom_link')
        .eq('email', user.email)
        .single()

      if (error || !data?.tutor) {
        setError('Uporabnik ni tutor ali profil ni najden.')
        return setLoading(false)
      }

      setTutor(data)
      setEmail(data.email)
      setBio(data.bio ?? '')
      setZoomLink(data.zoom_link ?? '')
      setProfilnaSlika(data.profilna_slika ?? '')

      // Pridobi ocene
      const { data: oceneData } = await supabase
        .from('Ocene')
        .select('komentar, tocke, ucenec:ucenec_id (email)')
        .eq('tutor_id', data.id)

      if (oceneData) {
        const formatiraneOcene = oceneData.map((o: any) => ({
          komentar: o.komentar,
          tocke: o.tocke,
          ucenec_email: o.ucenec?.email || 'Neznan učenec'
        }))
        setOcene(formatiraneOcene)
      }

      // Pridobi predmete in tipe predmetov
      await fetchPredmeti(data.id)
      
      // Pridobi dogodke
      await fetchDogodki(data.id)

      setLoading(false)
    }

    const fetchPredmeti = async (tutorId: number) => {
      // Pridobi vse predmete
      const { data: predmetiData } = await supabase
        .from('Predmeti')
        .select('id, naziv, fk_tipPredmeta_id')
        .order('naziv', { ascending: true })

      // Pridobi tipe predmetov
      const { data: tipiData } = await supabase
        .from('Tip_predmeta')
        .select('id, naziv')

      // Pridobi predmete, ki jih tutor že poučuje
      const { data: tutorPredmeti } = await supabase
        .from('Uporabniki_has_Predmeti')
        .select('fk_Predmeti')
        .eq('fk_Uporabniki', tutorId)
      console.log(tipiData)
      if (predmetiData) setPredmeti(predmetiData)
      
      if (tipiData) setTipiPredmetov(tipiData)
      if (tutorPredmeti) {
        setIzbraniPredmeti(tutorPredmeti.map(tp => tp.fk_Predmeti))
      }

    }

    const fetchDogodki = async (tutorId: number) => {
      const { data } = await supabase
        .from('Event')
        .select('*')
        .eq('fk_id_uporabnik', tutorId)
        .order('day_of_week', { ascending: true })
        .order('start_date_time', { ascending: true })

      if (data) setDogodki(data)
    }

    fetchTutor()
  }, [])

  const updateProfile = async () => {
    if (!tutor) return
    setError(null)
    setSuccess(null)

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError('Neveljaven email.')
    }

    if (email !== tutor.email) {
      const { error: authError } = await supabase.auth.updateUser({ email })
      if (authError) return setError('Napaka pri posodobitvi emaila: ' + authError.message)
    }

    const { error } = await supabase
      .from('Uporabniki')
      .update({
        email,
        bio,
        zoom_link: zoomLink,
        profilna_slika: profilnaSlika
      })
      .eq('id', tutor.id)

    if (error) {
      setError('Napaka pri shranjevanju: ' + error.message)
    } else {
      setSuccess('Profil uspešno posodobljen!')
      setTutor({ ...tutor, email, bio, zoom_link: zoomLink, profilna_slika: profilnaSlika })
      setEditMode(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !tutor) return

    const ext = file.name.split('.').pop()
    const fileName = `${tutor.id}.${ext}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('profilne-slike')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      return setError('Napaka pri nalaganju slike: ' + uploadError.message)
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('profilne-slike')
      .getPublicUrl(filePath)

    if (publicUrlData?.publicUrl) {
      setProfilnaSlika(publicUrlData.publicUrl)
      setSuccess('Slika uspešno naložena!')
    } else {
      setError('Ni bilo mogoče pridobiti javne povezave do slike.')
    }
  }
    const shraniPredmete = async () => {
    if (!tutor) return

    setError(null)
    setSuccess(null)
    
    try {
      // Najprej izbriši vse obstoječe povezave
      await supabase
        .from('Uporabniki_has_Predmeti')
        .delete()
        .eq('fk_Uporabniki', tutor.id)

      // Nato dodaj nove izbrane predmete
      if (izbraniPredmeti.length > 0) {
        const vnosi = izbraniPredmeti.map(predmet_id => ({
          fk_Uporabniki: tutor.id,
          fk_Predmeti: predmet_id
        }))

        const { error } = await supabase
          .from('Uporabniki_has_Predmeti')
          .insert(vnosi)

        if (error) throw error
      }

      setSuccess('Predmeti uspešno posodobljeni!')
      setPredmetiEditMode(false)
    } catch (err) {
      setError('Napaka pri shranjevanju predmetov: ' + (err as Error).message)
    }
  }
  const dodajNovPredmet = async () => {
  if (!novPredmetNaziv || !novPredmetTip || !tutor) {
    setError('Vnesite naziv in izberite tip predmeta')
    return
  }

  try {
    // Dodaj nov predmet
    const { data: novPredmet, error: insertError } = await supabase
      .from('Predmeti')
      .insert([
        {
          naziv: novPredmetNaziv,
          fk_tipPredmeta_id: novPredmetTip
        }
      ])
      .select()
      .single()

    if (insertError) throw insertError

    // Dodaj povezavo med tutorjem in novim predmetom
    const { error: povezavaError } = await supabase
      .from('Uporabniki_has_Predmeti')
      .insert([
        {
          fk_Uporabniki: tutor.id,
          fk_Predmeti: novPredmet.id
        }
      ])

    if (povezavaError) throw povezavaError

    // Posodobi stanje
    setPredmeti([...predmeti, novPredmet])
    setIzbraniPredmeti([...izbraniPredmeti, novPredmet.id])
    setNovPredmetNaziv('')
    setNovPredmetTip(null)
    setSuccess('Predmet uspešno dodan!')
  } catch (err) {
    setError('Napaka pri dodajanju predmeta: ' + (err as Error).message)
  }
}


  const dodajDogodek = async () => {
    if (!tutor) return

    const { title, description, day_of_week, start_date_time, end_date_time } = novDogodek
    if (!title || !start_date_time || !end_date_time) {
      setError('Izpolnite vsa obvezna polja')
      return
    }

    try {
      const { error } = await supabase
        .from('Event')
        .insert([{
          ...novDogodek,
          fk_id_uporabnik: tutor.id
        }])

      if (error) throw error

      // Osveži seznam dogodkov
      const { data } = await supabase
        .from('Event')
        .select('*')
        .eq('fk_id_uporabnik', tutor.id)

      if (data) setDogodki(data)

      // Ponastavi obrazec
      setNovDogodek({
        fk_id_uporabnik: NaN,
        fk_id_predmet: NaN,
        title: '',
        description: '',
        day_of_week: 'Ponedeljek',
        start_date_time: '',
        end_date_time: ''
      })
      setSuccess('Dogodek uspešno dodan!')
    } catch (err) {
      setError('Napaka pri dodajanju dogodka: ' + (err as Error).message)
    }
  }

  const izbrisiDogodek = async (id: number) => {
    try {
      const { error } = await supabase
        .from('Event')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDogodki(dogodki.filter(d => d.id !== id))
      setSuccess('Dogodek uspešno izbrisan!')
    } catch (err) {
      setError('Napaka pri brisanju dogodka: ' + (err as Error).message)
    }
  }

  if (loading) return <div className="tutor-profile-container"><p>Nalaganje...</p></div>
  if (!tutor) return <div className="tutor-profile-container"><p>Ni najdenega tutor profila.</p></div>
  return (
    <div className="tutor-profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1 className="profile-title">
            {tutor.ime} {tutor.priimek}
          </h1>

          {editMode ? (
            <>
              <div className="profile-detail">
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="profile-detail">
                <label>Bio:</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="profile-detail">
                <label>Zoom povezava:</label>
                <input type="text" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} />
              </div>

              <div className="file-upload">
                <label>Naloži profilno sliko:</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} />
              </div>
            </>
          ) : (
            <>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Bio:</strong> {bio || 'Ni opisa.'}</p>
              <p><strong>Zoom:</strong> {zoomLink ? <a href={zoomLink} target="_blank" rel="noopener noreferrer">{zoomLink}</a> : 'Ni povezave'}</p>
            </>
          )}

          <div className="mt-4">
            <button 
              className="edit-button" 
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Prekliči' : 'Uredi profil'}
            </button>
            {editMode && (
              <button 
                className="save-button" 
                onClick={updateProfile}
              >
                Shrani spremembe
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>

        {profilnaSlika && (
          <div className="profile-image-container">
            <img src={profilnaSlika} alt="Profilna slika" className="profile-image" />
          </div>
        )}
      </div>
          {/* Sekcija za predmete */}
      <div className="section">
        <div className="section-header">
          <h2>Predmeti</h2>
          <button 
            className="edit-button" 
            onClick={() => setPredmetiEditMode(!predmetiEditMode)}
          >
            {predmetiEditMode ? 'Prekliči' : 'Uredi predmete'}
          </button>
        </div>

        {predmetiEditMode ? (
          <div className="predmeti-edit">
            <div className="predmeti-grid">
              {tipiPredmetov.map(tip => (
                <div key={tip.id} className="tip-predmeta">
                  <h3>{tip.naziv}</h3>
                  <div className="predmeti-list">
                    {predmeti
                      .filter(p => p.fk_tipPredmeta_id === tip.id)
                      .map(predmet => (
                        <label key={predmet.id} className="predmet-checkbox">
                          <input
                            type="checkbox"
                            checked={izbraniPredmeti.includes(predmet.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setIzbraniPredmeti([...izbraniPredmeti, predmet.id])
                              } else {
                                setIzbraniPredmeti(izbraniPredmeti.filter(id => id !== predmet.id))
                              }
                            }}
                          />
                          {predmet.naziv}
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="nov-predmet">
              <h3>Dodaj nov predmet</h3>
              <div className="form-group">
                <label>Naziv predmeta:</label>
                <input 
                  type="text" 
                  value={novPredmetNaziv}
                  onChange={(e) => setNovPredmetNaziv(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Tip predmeta:</label>
                <select
                  value={novPredmetTip || ''}
                  onChange={(e) => setNovPredmetTip(Number(e.target.value))}
                >
                  <option value="">Izberi tip</option>
                  {tipiPredmetov.map(tip => (
                    <option key={tip.id} value={tip.id}>{tip.naziv}</option>
                  ))}
                </select>
              </div>
              <button 
                className="save-button"
                onClick={dodajNovPredmet}
              >
                Dodaj predmet
              </button>
            </div>

            <div className="form-actions">
              <button 
                className="save-button"
                onClick={shraniPredmete}
              >
                Shrani spremembe
              </button>
            </div>
          </div>
        ) : (
          <div className="predmeti-list">
            {izbraniPredmeti.length === 0 ? (
              <p>Tutor še nima izbranih predmetov.</p>
            ) : (
              <ul>
                {izbraniPredmeti.map(id => {
                  const predmet = predmeti.find(p => p.id === id)
                  return predmet ? <li key={id}>{predmet.naziv}</li> : null
                })}
              </ul>
            )}
          </div>
        )}
      </div>
   <div className="section">
        <div className="section-header">
          <h2>Urnik</h2>
          <button 
            className="edit-button" 
            onClick={() => setUrnikEditMode(!urnikEditMode)}
          >
            {urnikEditMode ? 'Prekliči' : 'Uredi urnik'}
          </button>
        </div>

        {urnikEditMode ? (
          <div className="urnik-edit">
            <div className="form-group">
              <label>Dan v tednu:</label>
              <select
                value={novDogodek.day_of_week}
                onChange={(e) => setNovDogodek({...novDogodek, day_of_week: e.target.value})}
              >
                <option value="Ponedeljek">Ponedeljek</option>
                <option value="Torek">Torek</option>
                <option value="Sreda">Sreda</option>
                <option value="Četrtek">Četrtek</option>
                <option value="Petek">Petek</option>
                <option value="Sobota">Sobota</option>
                <option value="Nedelja">Nedelja</option>
              </select>
            </div>
          
              <div className="form-group">
                <label>Predmeti:</label>
                <select
                  value={novDogodek.fk_id_predmet || ""}
                  onChange={(e) => setNovDogodek({...novDogodek, fk_id_predmet: Number(e.target.value)})}
                >
                  <option value="">Izberi predmet</option>
                  {predmeti
                    .filter(predmet => izbraniPredmeti.includes(predmet.id))
                    .map(predmet => (
                      <option key={predmet.id} value={predmet.id}>
                        {predmet.naziv}
                      </option>
                    ))}
                </select>
              </div>


            <div className="form-group">
              <label>Naslov:</label>
              <input
                type="text"
                value={novDogodek.title}
                onChange={(e) => setNovDogodek({...novDogodek, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Opis:</label>
              <textarea
                value={novDogodek.description}
                onChange={(e) => setNovDogodek({...novDogodek, description: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Začetek:</label>
              <input
                type="datetime-local"
                value={novDogodek.start_date_time}
                onChange={(e) => setNovDogodek({...novDogodek, start_date_time: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Konec:</label>
              <input
                type="datetime-local"
                value={novDogodek.end_date_time}
                onChange={(e) => setNovDogodek({...novDogodek, end_date_time: e.target.value})}
              />
            </div>

            <button 
              className="save-button"
              onClick={dodajDogodek}
            >
              Dodaj termin
            </button>

            <div className="dogodki-list">
              <h3>Obstoječi termini</h3>
              {dogodki.length === 0 ? (
                <p>Ni dodanih terminov.</p>
              ) : (
                <ul>
                  {dogodki.map(dogodek => (
                    <li key={dogodek.id} className="dogodek-item">
                      <div>
                        <strong>{dogodek.day_of_week}</strong>: {dogodek.title} ({dogodek.start_date_time} - {dogodek.end_date_time})
                        <p>{dogodek.description}</p>
                      </div>
                      <button 
                        className="delete-button"
                        onClick={() => dogodek.id && izbrisiDogodek(dogodek.id)}
                      >
                        Izbriši
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="urnik-view">
            {dogodki.length === 0 ? (
              <p>Ni dodanih terminov.</p>
            ) : (
              <div className="urnik-grid">
                {['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'].map(dan => {
                  const dogodkiNaDan = dogodki.filter(d => d.day_of_week === dan)
                  return dogodkiNaDan.length > 0 ? (
                    <div key={dan} className="urnik-dan">
                      <h3>{dan}</h3>
                      <ul>
                        {dogodkiNaDan.map(dogodek => (
                          <li key={dogodek.id}>
                            {dogodek.title} ({dogodek.start_date_time} - {dogodek.end_date_time})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="reviews-section">
        <h2>Komentarji in ocene</h2>
        {ocene.length === 0 ? (
          <p>Tutor še nima ocen.</p>
        ) : (
          <div>
            {ocene.map((o, i) => (
              <div key={i} className="review">
                <p><strong>Učenec:</strong> {o.ucenec_email}</p>
                <p><strong>Točke:</strong> {o.tocke}/5</p>
                <p><strong>Komentar:</strong> {o.komentar}</p>
              </div>
            ))}
          </div>
        )}
      </div>
       {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  )
}
