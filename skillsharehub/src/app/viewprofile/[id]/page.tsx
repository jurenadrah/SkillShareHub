'use client'

import MyEvents from '@/app/components/MyEvents'
import CalendarApp from '@/app/components/CalendarApp'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import '../../tutor.css'

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

type Tutor = {
  id: number
  ime: string
  priimek: string
  email: string
  bio: string | null
  profilna_slika: string | null
  tutor: boolean
  zoom_link: string | null
  tocke: number
  aktiven_banner: string | null
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

type Event = {
  id?: number
  fk_id_uporabnik: number
  fk_id_predmet: number
  title: string
  description: string
  event_type: 'single' | 'recurring'
  day_of_week: string | null
  start_date_time: string
  end_date_time: string
  recurrence_end_date?: string | null
}

type Banner = {
  id: number
  naziv: string
  cena: number
  slika_url: string
}

interface Komentar {
  id: number;
  postid: number | null;
  userid: number | null;
  senderid: number | null;
  content: string | null;
  created_at: string;
  tocke: number | null;
  sender: {
    ime: string;
    priimek: string;
    profilna_slika: string | null;
  };
}





export default function ProfileReadOnly() {
  const params = useParams();
  const userId = params.id;

  const [uporabnik, setUporabnik] = useState<Uporabnik | null>(null)
      
  
    // New states for user events
    const [userEvents, setUserEvents] = useState<UserEvent[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)
  
  
    // State for calendar view toggle
    const [showCalendar, setShowCalendar] = useState(false)

  const [tutor, setTutor] = useState<Tutor | null>(null)
    const [loading, setLoading] = useState(true)
  
    // Profilne spremenljivke
    const [email, setEmail] = useState('')
    const [bio, setBio] = useState('')
    const [zoomLink, setZoomLink] = useState('')
    const [profilnaSlika, setProfilnaSlika] = useState('')
  
     const bannerPrices = [60, 80, 110, 190, 300]
  
    // Predmeti
    const [predmeti, setPredmeti] = useState<Predmet[]>([])
    const [tipiPredmetov, setTipiPredmetov] = useState<TipPredmeta[]>([])
    const [izbraniPredmeti, setIzbraniPredmeti] = useState<number[]>([])
  
    // Urnik
    const [dogodki, setDogodki] = useState<Event[]>([])
    const toLocalDateTimeString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
  
    const [ocene, setOcene] = useState<Ocena[]>([])
    const [bannerji, setBannerji] = useState<Banner[]>([])
    const [error, setError] = useState<string | null>(null)
  
    
   useEffect(() => {
      const fetchTutor = async () => {
         
        const { data, error } = await supabase
          .from('Uporabniki')
          .select('id, ime, priimek, email, bio, profilna_slika, tutor, zoom_link, tocke, aktiven_banner')
          .eq('id', userId)
          .single()
  
        if (error) {
          setError('Profil ni najden.')
          return setLoading(false)
        }

        if (!data?.tutor){
          console.log("Uporabnik ni tutor")
          data.tutor=true;
        }
  
        setTutor({
          ...data,
          tocke: data.tocke || 50,
          aktiven_banner: data.aktiven_banner || null
        })
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
          const formatiraneOcene = oceneData.map((o: { komentar: string; tocke: number; ucenec?: { email?: string }[] }) => ({
            komentar: o.komentar,
            tocke: o.tocke,
            ucenec_email: Array.isArray(o.ucenec) && o.ucenec.length > 0 && o.ucenec[0]?.email
              ? o.ucenec[0].email
              : 'Neznan učenec'
          }))
          setOcene(formatiraneOcene)
        }
  
        // Pridobi predmete in tipe predmetov
        await fetchPredmeti(data.id)
        
        // Pridobi dogodke
        await fetchDogodki(data.id)
  
        // Pridobi bannerje z pravilnimi URL-ji iz Storage
        const { data: bannerData } = await supabase
          .from('Bannerji')
          .select('*')
          .order('cena', { ascending: true })
  
        if (bannerData) {
          // Dodaj pravilne URL-je iz Storage-a
          const updatedBanners = bannerData.map(banner => ({
            ...banner,
            slika_url: supabase.storage
              .from('bannerji')
              .getPublicUrl(`${banner.id}.png`).data.publicUrl
          }))
          setBannerji(updatedBanners)
        }
  
        setLoading(false)
      }
  
      const fetchPredmeti = async (tutorId: number) => {
        const { data: predmetiData } = await supabase
          .from('Predmeti')
          .select('id, naziv, fk_tipPredmeta_id')
          .order('naziv', { ascending: true })
  
        const { data: tipiData } = await supabase
          .from('Tip_predmeta')
          .select('id, naziv')
  
        const { data: tutorPredmeti } = await supabase
          .from('Uporabniki_has_Predmeti')
          .select('fk_Predmeti')
          .eq('fk_Uporabniki', tutorId)
  
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
      
        if (data) {
          // Convert ISO strings to local datetime format for display
          const convertedData = data.map(event => ({
            ...event,
            start_date_time: event.start_date_time ? toLocalDateTimeString(new Date(event.start_date_time)) : event.start_date_time,
            end_date_time: event.end_date_time ? toLocalDateTimeString(new Date(event.end_date_time)) : event.end_date_time,
            recurrence_end_date: event.recurrence_end_date ? toLocalDateTimeString(new Date(event.recurrence_end_date)) : event.recurrence_end_date
          }));
          setDogodki(convertedData);
        }
      }
  
      fetchTutor()
    }, [])
  
  const getNextBanner = () => {
    if (!tutor || !bannerji.length) return null;
  
    // Če tutor nima bannerja, vrni najcenejšega
    if (!tutor.aktiven_banner) {
      return bannerji.find(b => b.cena === bannerPrices[0]) || null;
    }
  
    // Poišči trenutni banner
    const currentBanner = bannerji.find(b => b.slika_url === tutor.aktiven_banner);
    if (!currentBanner) return null;
  
    // Poišči naslednji banner po ceni
    const currentIndex = bannerPrices.indexOf(currentBanner.cena);
    if (currentIndex === -1 || currentIndex >= bannerPrices.length - 1) return null;
  
    return bannerji.find(b => b.cena === bannerPrices[currentIndex + 1]) || null;
  };
  
    const [selectedView, setSelectedView] = useState<'student' | 'tutor' | null>("tutor");

    const toggleUserRole = async () => {
      if(selectedView=="tutor"){
        setSelectedView("student");
      }
      if(selectedView=="student"){
        setSelectedView("tutor");
      }
    }

    useEffect(() => {
        const fetchProfile = async () => {
              
          const { data } = await supabase
            .from('Uporabniki')
            .select('id, ime, priimek, email, bio, profilna_slika, tutor')
            .eq('id',userId)
            .single()
    
          if (!data) {
            setError('Napaka pri nalaganju profila.')
          } else {
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
            (data || []).map((ue) => ({
              ...ue,
              event: ue.event && Array.isArray(ue.event) ? {
                ...ue.event[0],
                predmet: ue.event[0]?.predmet && Array.isArray(ue.event[0].predmet)
                  ? ue.event[0].predmet[0]
                  : ue.event[0]?.predmet
              } : ue.event
            })) as UserEvent[]
          )
        } catch (err) {
          console.error('Error fetching user events:', err)
          setError('Napaka pri nalaganju dogodkov.')
        } finally {
          setEventsLoading(false)
        }
      }
    
      const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email)
      }

      

      const [komentarji, setKomentarji] = useState<Komentar[]>([]);
      const [newComment, setNewComment] = useState('');
      const [rating, setRating] = useState<number | null>(null);
      const [currentUser, setCurrentUser] = useState<any>(null);

      async function fetchLoginUser() {
        // 1. Pridobi trenutno prijavljenega uporabnika prek Supabase Auth
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setLoading(false);
          return;
        }

        // 2. Pridobi dodatne podatke o uporabniku iz tabele 'Uporabniki'
        const { data: uporabnikData, error: uporabnikError } = await supabase
          .from('Uporabniki')
          .select('id, ime, priimek, email, bio, profilna_slika, tutor')
          .eq('email', user.email)
          .single();

        if (uporabnikError || !uporabnikData) {
          setLoading(false);
          return;
        }

        // 3. Shrani trenutno uporabnika v state
        setCurrentUser(uporabnikData);
      }




      useEffect(() => {
        fetchKomentarji()
      }, []);

      useEffect(() => {
        fetchLoginUser();
      }, []);


      async function fetchKomentarji() {
          const { data, error } = await supabase
            .from('Komentar')
            .select(`
              *,
              sender:senderid (
                ime,
                priimek,
                profilna_slika
              )
            `)
            .eq('userid',userId)
            .order('created_at', { ascending: false });
              
          if (error) {
            console.error('Napaka pri pridobivanju komentarjev:', error);
            return;
          }
          setKomentarji(data);
        }

      const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        const { data, error } = await supabase
          .from('Komentar')
          .insert([
            {
              userid: userId,        // oseba, ki prejme komentar
              senderid: currentUser.id,      // oseba, ki pošilja komentar
              content: newComment.trim(),
              tocke: rating || null,         // če imate oceno, lahko jo tu dodate
            },
          ]);

        if (error) {
          console.error('Napaka pri shranjevanju komentarja:', error);
          alert('Napaka pri oddaji komentarja.');
        }

        if(userId!=currentUser.id){
          // Če je bila dodana ocena
          if (rating !== null) {
            // Najprej pridobi trenutne vrednosti
            const { data: userData, error: fetchError } = await supabase
              .from('Uporabniki')
              .select('tocke')
              .eq('id', userId)
              .single();

            if (fetchError || !userData) {
              console.error('Napaka pri pridobivanju uporabnika:', fetchError);
              return;
            }

            const noveTocke = (userData.tocke || 0) + rating;

            const { error: updateError } = await supabase
              .from('Uporabniki')
              .update({
                tocke: noveTocke,
              })
              .eq('id', userId);

            if (updateError) {
              console.error('Napaka pri posodabljanju ocen:', updateError);
            }
          }
        }
        setNewComment('');
        setRating(null); // če imate oceno
        fetchKomentarji(); // osveži komentarje, po potrebi implementiraj
      };

      const handleDeleteComment = async (komentarId: number) => {
        const confirmDelete = confirm('Ali res želiš izbrisati ta komentar?');
        if (!confirmDelete) return;

        const { error } = await supabase
          .from('Komentar')
          .delete()
          .eq('id', komentarId);

        if (error) {
          console.error('Napaka pri brisanju komentarja:', error);
          alert('Napaka pri brisanju komentarja.');
        } else {
          fetchKomentarji(); // ponovno naloži komentarje
        }
      };


    
    if (loading) return <div className="tutor-profile-container"><p>Nalaganje...</p></div>
    if (!tutor) return <div className="tutor-profile-container"><p>Ni najdenega tutor profila.</p></div>
  
    const nextBanner = getNextBanner()
    const hasMaxBanner = tutor.aktiven_banner && 
    bannerji.some(b => b.slika_url === tutor.aktiven_banner && b.cena === bannerPrices[bannerPrices.length - 1])
  
  
  return (
    <div>
      <div className="bg-gray-50">
        {/* Header z izbiro pogleda */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Profil - {tutor.ime} {tutor.priimek}
              </h1>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Pogled:</span>
                <div className="flex space-x-2">
                  <div
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedView === 'student'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Učenec
                  </div>
                  <div
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedView === 'tutor'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Tutor
                  </div>
                </div>

                {/* ✅ Button to toggle role */}
                <button
                  onClick={toggleUserRole}
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700"
                >
                  Zamenjaj vlogo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Dinamična vsebina */}
      <div className="max-w-7xl mx-auto">
        {selectedView === 'student' ? (
        <div className="student-profile-container">
          {/*Start za studenta */}
          <div className="p-6 max-w-7xl mx-auto bg-[#fdf6e3] rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Profil učenca</h1>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Profile Info */}
              <div>
                <div className="relative grid grid-cols-2 gap-4 items-start">
                  {/* Profile Details */}
                  <div>
                    {/* Email */}
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Email:</label>
                      
                        <p className="text-gray-800">{email}</p>
                      
                    </div>

                    {/* Bio */}
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Bio:</label>
                        <p className="text-gray-800 whitespace-pre-wrap">{bio || 'Ni opisa.'}</p>
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
                    
                  </div>
                </div>

                
              </div>

              {/* Right Column - My Events */}
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Dogodki</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCalendar(false)}
                        className={`px-3 py-1 text-sm rounded ${
                          !showCalendar 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Seznam
                      </button>
                      <button
                        onClick={() => setShowCalendar(true)}
                        className={`px-3 py-1 text-sm rounded ${
                          showCalendar 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Koledar
                      </button>
                    </div>
                  </div>
                  
                  {eventsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                      <p className="mt-2 text-gray-600">Nalaganje dogodkov...</p>
                    </div>
                  ) : (
                    <>
                      {!showCalendar ? (
                        <MyEvents 
                              userEvents={userEvents}
                              onEventRemoved={function (userEventId: number): void {
                                throw new Error('Function not implemented.')
                              } } 
                              hasGoogleConnected={false}                        />
                      ) : (
                        <div className="calendar-container">
                          <CalendarApp userEvents={userEvents} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="tutor-profile-container">
        {/* Bannerji section - popravljena verzija */}
        {/*Start za tutorja */}
      <div className="profile-header">
        <div className="profile-info">
          <h1 className="profile-title">
            {tutor.ime} {tutor.priimek}
          </h1>
          <>
            <p>
              <strong>Email:</strong>{' '}
              <a 
                href={`mailto:${email}`}
                className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors duration-200 cursor-pointer"
              >
                {email}
              </a>
            </p>
            <p><strong>Bio:</strong> {bio || 'Ni opisa.'}</p>
            <p>
              <strong>Zoom:</strong>{' '}
              {zoomLink ? (
                <a 
                  href={zoomLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors duration-200 cursor-pointer"
                >
                  {zoomLink}
                </a>
              ) : (
                'Ni povezave'
              )}
            </p>
          </>
          

        </div>

        {profilnaSlika && (
          <div className="profile-image-container">
            <img src={profilnaSlika} alt="Profilna slika" className="profile-image" />
          </div>
        )}
      </div>
    {/* Bannerji section */}
    <div className="section">
      <div className="section-header">
        <h2>Banner (Točke: {tutor.tocke})</h2>
      </div>
      <div className="current-banner-view">
        {tutor.aktiven_banner ? (
          <>
            <h3>Trenutni banner:</h3>
            <img 
              src={tutor.aktiven_banner} 
              alt="Trenutni banner" 
              className="banner-image"
            />
            <p>Level: {bannerPrices.findIndex(price => 
              bannerji.find(b => b.slika_url === tutor.aktiven_banner)?.cena === price
            ) + 1} / {bannerPrices.length}</p>
            {!hasMaxBanner && (
              <p>Za nadgradnjo kliknite gumb &quot;Upgrade banner&quot;.</p>
            )}
          </>
        ) : (
          <p>Trenutno ni aktivnega bannerja.</p>
        )}
      </div>
  
</div>
      {/* Sekcija za predmete */}
      <div className="section">
        <div className="section-header">
          <h2>Predmeti</h2>
        </div>
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
      </div>

      {/* Sekcija za urnik */}
      <div className="section">
        <div className="section-header">
          <h2>Urnik</h2>
        </div>

        {
          <div className="urnik-view">
            {dogodki.length === 0 ? (
              <p>Ni dodanih terminov.</p>
            ) : (
              <div className="urnik-grid">
                {/* Prikaz ponavljajočih se terminov po dnevih */}
                {['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek', 'Sobota', 'Nedelja'].map(dan => {
                  const dogodkiNaDan = dogodki.filter(d => 
                    d.event_type === 'recurring' && d.day_of_week === dan
                  )
                  return dogodkiNaDan.length > 0 ? (
                    <div key={dan} className="urnik-dan">
                      <h3>{dan}</h3>
                      <ul>
                        {dogodkiNaDan.map(dogodek => (
                          <li key={dogodek.id}>
                            <strong>{dogodek.title}</strong> ({dogodek.start_date_time.split('T')[1]} - {dogodek.end_date_time.split('T')[1]})
                            <p>Predmet: {predmeti.find(p => p.id === dogodek.fk_id_predmet)?.naziv || 'Neznan predmet'}</p>
                            {dogodek.recurrence_end_date && (
                              <p>Do: {new Date(dogodek.recurrence_end_date).toLocaleDateString()}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                })}

                {/* Prikaz enkratnih terminov v ločenem delu */}
                <div className="enkratni-termini">
                  <h3>Enkratni termini</h3>
                  {dogodki.filter(d => d.event_type === 'single').length === 0 ? (
                    <p>Ni enkratnih terminov.</p>
                  ) : (
                    <ul>
                      {dogodki
                        .filter(d => d.event_type === 'single')
                        .map(dogodek => (
                          <li key={dogodek.id}>
                            <strong>{dogodek.title}</strong> ({new Date(dogodek.start_date_time).toLocaleDateString()} {dogodek.start_date_time.split('T')[1]} - {dogodek.end_date_time.split('T')[1]})
                            <p>Predmet: {predmeti.find(p => p.id === dogodek.fk_id_predmet)?.naziv || 'Neznan predmet'}</p>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
             
              </div>
            )}   
          </div>
        }
        </div>{error && <div className="error-message">{error}</div>}

              <div className="reviews-section" style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
                <div className="comment-form">
                  <div
                  style={{
                    background: '#f9f9f9',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    maxWidth: 600,
                    margin: '2rem auto',
                    fontFamily: 'Arial, sans-serif',
                  }}
                  >
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Dodaj komentar</h3>

                    <textarea
                      placeholder="Napiši komentar..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        resize: 'vertical',
                        marginBottom: '1rem',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                      <label htmlFor="rating" style={{ fontWeight: 'bold' }}>Ocena:</label>
                      <select
                        id="rating"
                        value={rating ?? ''}
                        onChange={(e) => setRating(Number(e.target.value) || null)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="">Izberi oceno</option>
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleCommentSubmit}
                      style={{
                        backgroundColor: '#0070f3',
                        color: 'white',
                        padding: '0.6rem 1.2rem',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0059c1')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
                    >
                      Oddaj komentar
                    </button>
                  </div>
                </div>



                <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid #0070f3', paddingBottom: '0.5rem' }}>Komentarji z ocenami</h2>

                {komentarji.length === 0 ? (
                  <p>Tutor še nima komentarjev.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {komentarji.map((k, i) => {
                      const canDelete = currentUser?.id === k.senderid || currentUser?.id === k.userid;

                      return (
                        <div
                          key={i}
                          className="review-card"
                          style={{
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            borderRadius: 10,
                            padding: '1rem',
                            backgroundColor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                              src={k.sender.profilna_slika ?? '/default-profile.png'}
                              alt={`${k.sender.ime} ${k.sender.priimek}`}
                              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <p style={{ fontWeight: '700', margin: 0 }}>{k.sender.ime} {k.sender.priimek}</p>
                              {typeof k.tocke === 'number' && (
                                <p style={{ margin: 0, color: '#f39c12' }}>Ocena: {k.tocke}/5</p>
                              )}
                            </div>
                            <small style={{ marginLeft: 'auto', color: '#666', fontSize: '0.8rem' }}>
                              {new Date(k.created_at).toLocaleDateString()}
                            </small>
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteComment(k.id)}
                                title="Izbriši komentar"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#e74c3c',
                                  cursor: 'pointer',
                                  marginLeft: '1rem',
                                  fontSize: '1.2rem',
                                }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          <p style={{ marginTop: '0.5rem' }}>{k.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

          {error && <div className="error-message">{error}</div>}
            </div>

      
      </div>)}
    </div>
  
</div>)}
