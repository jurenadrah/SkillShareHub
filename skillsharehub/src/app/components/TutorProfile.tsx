'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import '../tutor.css'
import React from 'react'

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

export default function TutorProfile() {
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [predmetiEditMode, setPredmetiEditMode] = useState(false)
  const [urnikEditMode, setUrnikEditMode] = useState(false)
  const [bannerjiEditMode, setBannerjiEditMode] = useState(false)

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
  const [novPredmetNaziv, setNovPredmetNaziv] = useState('')
  const [novPredmetTip, setNovPredmetTip] = useState<number | null>(null)

  // Urnik
  const [dogodki, setDogodki] = useState<Event[]>([])
  const [eventType, setEventType] = useState<'single' | 'recurring'>('single')
  const toLocalDateTimeString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  const toISOString = (localDateTimeString: string): string => {
  return new Date(localDateTimeString).toISOString();
  };

  const [novDogodek, setNovDogodek] = useState<Event>({
    fk_id_predmet: NaN,
    fk_id_uporabnik: NaN,
    title: '',
    description: '',
    day_of_week: null,
    start_date_time: toLocalDateTimeString(new Date()),
    end_date_time: toLocalDateTimeString(new Date(Date.now() + 60 * 60 * 1000)),
    event_type: 'single',
    recurrence_end_date: toLocalDateTimeString(new Date()),
  });

  const [ocene, setOcene] = useState<Ocena[]>([])
  const [bannerji, setBannerji] = useState<Banner[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const updateProfile = async () => {
  if (!tutor) return;
  setError(null);
  setSuccess(null);

  try {
    const { error } = await supabase
      .from('Uporabniki')
      .update({
        email: email,
        bio: bio,
        zoom_link: zoomLink,
        profilna_slika: profilnaSlika
      })
      .eq('id', tutor.id);

    if (error) throw error;

    // Osveži podatke
    const { data } = await supabase
      .from('Uporabniki')
      .select('*')
      .eq('id', tutor.id)
      .single();

    if (data) {
      setTutor(data);
      setSuccess('Profil uspešno posodobljen!');
      setEditMode(false); // Zapri urejanje po uspešnem shranjevanju
    }
  } catch (err) {
    setError('Napaka pri posodabljanju profila: ' + (err as Error).message);
  }
};
 useEffect(() => {
    const fetchTutor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data, error } = await supabase
        .from('Uporabniki')
        .select('id, ime, priimek, email, bio, profilna_slika, tutor, zoom_link, tocke, aktiven_banner')
        .eq('email', user.email)
        .single()

      if (error || !data?.tutor) {
        setError('Uporabnik ni tutor ali profil ni najden.')
        return setLoading(false)
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
const kupiBanner = async () => {
  if (!tutor) return;

  const nextBanner = getNextBanner();
  if (!nextBanner) {
    setError('Ni več bannerjev za nadgradnjo ali imate že najvišji banner.');
    return;
  }

  try {
    // Posodobi bazo
    const { error } = await supabase
      .from('Uporabniki')
      .update({
        tocke: tutor.tocke - nextBanner.cena,
        aktiven_banner: nextBanner.slika_url
      })
      .eq('id', tutor.id);

    if (error) throw error;

    // Osveži stanje
    const { data: updatedTutor } = await supabase
      .from('Uporabniki')
      .select('*')
      .eq('id', tutor.id)
      .single();

    if (updatedTutor) {
      setTutor(updatedTutor);
      setSuccess(`Uspešno ste nadgradili na banner level ${bannerPrices.indexOf(nextBanner.cena) + 1}!`);
    }
  } catch (err) {
    setError('Napaka pri nakupu bannerja: ' + (err as Error).message);
  }
};

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

    // Validacija glede na tip dogodka
    if (eventType === 'single' && !novDogodek.start_date_time) {
      setError('Izberite datum za enkratni termin')
      return
    }

    if (eventType === 'recurring' && !novDogodek.day_of_week) {
      setError('Izberite dan v tednu za ponavljajoči termin')
      return
    }

    if (!novDogodek.title) {
      setError('Vnesite naslov termina')
      return
    }

    if (isNaN(novDogodek.fk_id_predmet)) {
      setError('Izberite predmet')
      return
    }

    // Preveri časovno veljavnost
    const startTime = new Date(novDogodek.start_date_time)
    const endTime = new Date(novDogodek.end_date_time)
    
    if (startTime >= endTime) {
      setError('Čas konca mora biti za časom začetka')
      return
    }

    // Preveri ponavljajoče termine
    if (eventType === 'recurring' && novDogodek.recurrence_end_date) {
      const endDate = new Date(novDogodek.recurrence_end_date)
      if (endDate < startTime) {
        setError('Datum konca ponavljanja mora biti za datumom začetka')
        return
      }
    }

  try {
    const dogodekZaShranjevanje = {
      ...novDogodek,
      fk_id_uporabnik: tutor.id,
      event_type: eventType,
      day_of_week: eventType === 'single' ? null : novDogodek.day_of_week,
      // Convert local datetime strings to ISO for database storage
      start_date_time: toISOString(novDogodek.start_date_time),
      end_date_time: toISOString(novDogodek.end_date_time),
      recurrence_end_date: novDogodek.recurrence_end_date ? toISOString(novDogodek.recurrence_end_date) : null
    }

    const { error, data: insertedEvent } = await supabase
      .from('Event')
      .insert([dogodekZaShranjevanje])
      .select()
      .single()

    if (error) throw error

    // Add the new event to existing state (convert back to local time for display)
    if (insertedEvent) {
      const newEventForDisplay = {
        ...insertedEvent,
        start_date_time: toLocalDateTimeString(new Date(insertedEvent.start_date_time)),
        end_date_time: toLocalDateTimeString(new Date(insertedEvent.end_date_time)),
        recurrence_end_date: insertedEvent.recurrence_end_date ? toLocalDateTimeString(new Date(insertedEvent.recurrence_end_date)) : null
      };
      setDogodki(prevDogodki => [...prevDogodki, newEventForDisplay]);
    }

    // Reset form with local time
    setNovDogodek({
      fk_id_predmet: NaN,
      fk_id_uporabnik: NaN,
      title: '',
      description: '',
      day_of_week: null,
      start_date_time: toLocalDateTimeString(new Date()),
      end_date_time: toLocalDateTimeString(new Date(Date.now() + 60 * 60 * 1000)),
      event_type: 'single',
      recurrence_end_date: toLocalDateTimeString(new Date())
    })

    setEventType('single')
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


  const [komentarji, setKomentarji] = useState<Komentar[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

    async function fetchKomentarji() {
      console.log(currentUser.id)
      const { data, error } = await supabase
        .from('Komentar')
        .select(`*,
          sender:senderid (
            ime,
            priimek,
            profilna_slika
          )
        `)
        .eq('userid',currentUser?.id)
        .order('created_at', { ascending: false });
          
      if (error) {
        console.error('Napaka pri pridobivanju komentarjev:', error);
        return;
      }
      setKomentarji(data);
    }

    useEffect(() => {
      fetchLoginUser();
    }, []);
    useEffect(() => {
      if (currentUser) {
        fetchKomentarji();
      }
    }, [currentUser]);

    

    

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


  if (loading) return <div className="tutor-profile-container"><p>Nalaganje...</p></div>
  if (!tutor) return <div className="tutor-profile-container"><p>Ni najdenega tutor profila.</p></div>

  const nextBanner = getNextBanner()
  const hasMaxBanner = tutor.aktiven_banner && 
    bannerji.some(b => b.slika_url === tutor.aktiven_banner && b.cena === bannerPrices[bannerPrices.length - 1])




    

    









  return (
    <div className="tutor-profile-container">
        {/* Bannerji section - popravljena verzija */}
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
    <h2>Moji bannerji (Točke: {tutor.tocke})</h2>
    <button 
      className="edit-button" 
      onClick={() => setBannerjiEditMode(!bannerjiEditMode)}
    >
      {bannerjiEditMode ? 'Prekliči' : 'Upgrade banner'}
    </button>
  </div>

  {bannerjiEditMode ? (
    <div className="banner-upgrade-container">
      {tutor.aktiven_banner ? (
        <div className="current-banner">
          <h3>Trenutni banner:</h3>
          <img 
            src={tutor.aktiven_banner} 
            alt="Trenutni banner" 
            className="banner-image"
          />
          <p>Level: {bannerPrices.findIndex(price => 
            bannerji.find(b => b.slika_url === tutor.aktiven_banner)?.cena === price
          ) + 1} / {bannerPrices.length}</p>
        </div>
      ) : (
        <div className="no-banner">
          <p>Trenutno nimate aktivnega bannerja.</p>
        </div>
      )}

      {nextBanner && (
        <div className="next-banner">
          <h3>Naslednji banner:</h3>
          <img 
            src={nextBanner.slika_url} 
            alt="Naslednji banner" 
            className="banner-image"
          />
          <p>Cena: {nextBanner.cena} točk</p>
          <button
            className={`save-button ${tutor.tocke < nextBanner.cena ? 'disabled' : ''}`}
            onClick={kupiBanner}
            disabled={tutor.tocke < nextBanner.cena}
          >
            {tutor.tocke >= nextBanner.cena ? 'Nadgradi' : 'Premalo točk'}
          </button>
          {tutor.tocke < nextBanner.cena && (
            <p className="points-needed">
              Potrebujete še {nextBanner.cena - tutor.tocke} točk za nadgradnjo.
            </p>
          )}
        </div>
      )}

      {hasMaxBanner && (
        <div className="max-banner-message">
          <p>Čestitamo! Imate že najvišji možni banner.</p>
        </div>
      )}
    </div>
  ) : (
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
        <p>Trenutno nimate aktivnega bannerja.</p>
      )}
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

      {/* Sekcija za urnik */}
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
              <label>Tip termina:</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as 'single' | 'recurring')}
              >
                <option value="single">Enkratni termin</option>
                <option value="recurring">Ponavljajoči se termin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Predmet:</label>
              <select
                value={isNaN(novDogodek.fk_id_predmet) ? '' : novDogodek.fk_id_predmet}
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
              <label>Naslov termina:</label>
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

            {/* Enkratni termin - prikaži izbiro datuma */}
            {eventType === 'single' && (
              <div className="form-group">
                <label>Datum:</label>
                <input
                  type="date"
                  value={novDogodek.start_date_time.split('T')[0]}
                  onChange={(e) => {
                    const time = novDogodek.start_date_time.split('T')[1] || '00:00'
                    setNovDogodek({
                      ...novDogodek,
                      start_date_time: `${e.target.value}T${time}`,
                      end_date_time: `${e.target.value}T${novDogodek.end_date_time.split('T')[1] || '00:00'}`
                    })
                  }}
                />
              </div>
            )}

            {/* Ponavljajoči termin - prikaži izbiro dneva in obdobja ponavljanja */}
            {eventType === 'recurring' && (
              <>
                <div className="form-group">
                  <label>Dan v tednu:</label>
                  <select
                    value={novDogodek.day_of_week || ''}
                    onChange={(e) => setNovDogodek({...novDogodek, day_of_week: e.target.value})}
                  >
                    <option value="">Izberi dan</option>
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
                  <label>Datum konca ponavljanja:</label>
                  <input
                    type="date"
                    value={novDogodek.recurrence_end_date || ''}
                    onChange={(e) => setNovDogodek({...novDogodek, recurrence_end_date: e.target.value})}
                  />
                </div>
              </>
            )}

            {/* Skupna polja za oba tipa terminov */}
            <div className="form-group">
              <label>Ura začetka:</label>
              <input
                type="time"
                value={novDogodek.start_date_time.split('T')[1] || '00:00'}
                onChange={(e) => {
                  const date = novDogodek.start_date_time.split('T')[0]
                  setNovDogodek({
                    ...novDogodek,
                    start_date_time: `${date}T${e.target.value}`
                  })
                }}
              />
            </div>

            <div className="form-group">
              <label>Ura konca:</label>
              <input
                type="time"
                value={novDogodek.end_date_time.split('T')[1] || '00:00'}
                onChange={(e) => {
                  const date = novDogodek.end_date_time.split('T')[0]
                  setNovDogodek({
                    ...novDogodek,
                    end_date_time: `${date}T${e.target.value}`
                  })
                }}
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
                        <strong>{dogodek.title}</strong>
                        {dogodek.event_type === 'recurring' ? (
                          <>
                            <p>Ponavljajoči se termin: {dogodek.day_of_week} {dogodek.start_date_time.split('T')[1]} - {dogodek.end_date_time.split('T')[1]}</p>
                            {dogodek.recurrence_end_date && (
                              <p>Do: {new Date(dogodek.recurrence_end_date).toLocaleDateString()}</p>
                            )}
                          </>
                        ) : (
                          <p>Enkratni termin: {new Date(dogodek.start_date_time).toLocaleDateString()} {dogodek.start_date_time.split('T')[1]} - {dogodek.end_date_time.split('T')[1]}</p>
                        )}
                        <p>Predmet: {predmeti.find(p => p.id === dogodek.fk_id_predmet)?.naziv || 'Neznan predmet'}</p>
                        {dogodek.description && <p>Opis: {dogodek.description}</p>}
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
        )}
      </div>{error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="reviews-section">
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
      {success && <div className="success-message">{success}</div>}
    </div>
    </div>
  )
}