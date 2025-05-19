'use client'

import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import VideoPreview from '@/app/components/VideoPreview';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react'


type Uporabnik = {
  id: number
  Ime: string
  Priimek: string
  email: string
}


export default function Home() {
  const [user, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('Uporabniki').select('*')
      if (error) {
        console.error('Fetch error:', error)
      } else {
        console.log('Fetched data:', data)
        setUsers(data as Uporabnik[])
      }
      setLoading(false)  // Also update loading state here
    }

    fetchUsers()

    
  }, [])


  return (
    <main className="bg-[#fefefe]">
      <Navbar />
      <div className="bg-orange-200 text-center py-3 font-semibold text-xl">
        Dobrodošli na SkillShareHub
      </div>
      <Hero />

      {/* VIDEO SEKCIJA */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <VideoPreview title="Online Classes from Anywhere" duration="00:32" />
        <VideoPreview title="Class Title" duration="00:31" />
        <VideoPreview title="Class Title" duration="00:29" />
        <VideoPreview title="Class Title" duration="00:23" />
      </section>

      {/* URNIK */}
      <section className="py-12 bg-white text-center">
        <h2 className="text-3xl font-bold mb-2">Tedenski Urnik</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Tukaj lahko najdeš naš tedenski urnik z delavnicami, predavanji in urjenji.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto px-4">
          {[
            {
              dan: 'Ponedeljek',
              naslov: 'Uvod v Mind Mapping',
              opis: 'Organizacija študijskega gradiva',
              predavatelj: 'Ana Novak',
              ura: '17:00 - 18:00',
            },
            {
              dan: 'Torek',
              naslov: 'Učenje Matematike',
              opis: 'Reševanje matematičnih problemov',
              predavatelj: 'Marko Horvat',
              ura: '16:00 - 17:00',
            },
            {
              dan: 'Sreda',
              naslov: 'Tuji Jeziki',
              opis: 'Hitro učenje tujega jezika',
              predavatelj: 'Maja Kovač',
              ura: '15:00 - 16:00',
            },
            {
              dan: 'Četrtek',
              naslov: 'Branje in Pisanje',
              opis: 'Izpiljeno izražanje',
              predavatelj: 'Borut Cvetko',
              ura: '14:00 - 15:00',
            },
            {
              dan: 'Petek',
              naslov: 'Izpitne Priprave',
              opis: 'Metode za pripravo na izpite',
              predavatelj: 'Tina Zupan',
              ura: '13:00 - 14:00',
            },
          ].map((ura, i) => (
            <div key={i} className="bg-orange-100 p-4 rounded-lg shadow text-left">
              <h3 className="font-bold text-lg text-center">{ura.dan}</h3>
              <p className="font-semibold mt-2">{ura.naslov}</p>
              <p className="text-sm text-gray-700">{ura.opis}</p>
              <p className="mt-2 text-sm italic">{ura.predavatelj}</p>
              <p className="text-sm">{ura.ura}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O SKILLHUBU */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl font-bold mb-4">O SkillHubu</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          SkillHub je inovativna platforma, ki ti pomaga izboljšati študijske spretnosti in omogoča učenje skozi nove tehnike ter izmenjavo znanja znotraj študentske skupnosti.
        </p>
        <ul>  
        {user.map((user) => (
            <li key={user.id} className="mb-2">
              {user.Ime ?? 'No name'} (ID: {user.id})
              {user.Priimek ?? 'No name'} (ID: {user.id})  
              {user.email ?? 'No name'} (ID: {user.id})  
            </li>
          ))}
        </ul>



      </section>

      {/* KONTAKTNA SEKCIJA */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Kontakt</h3>
            <p>123-456-7890</p>
            <p>info@myhub.com</p>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Nikoli ne zamudi predavanja.</h4>
              <form className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Email *"
                  className="p-2 rounded text-black"
                />
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  Da, želim prejemati obvestila.
                </label>
                <button className="bg-orange-300 text-black font-semibold px-4 py-2 rounded w-fit hover:bg-orange-400">
                  Naroči se
                </button>
              </form>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Vprašaj nas karkoli</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ime *"
                  className="p-2 rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Priimek *"
                  className="p-2 rounded text-black"
                />
              </div>
              <input
                type="email"
                placeholder="Email *"
                className="p-2 rounded w-full text-black"
              />
              <input
                type="text"
                placeholder="Zadeva"
                className="p-2 rounded w-full text-black"
              />
              <textarea
                placeholder="Sporočilo..."
                className="p-2 rounded w-full h-24 text-black"
              ></textarea>
              <button className="bg-orange-300 text-black font-semibold px-6 py-2 rounded hover:bg-orange-400">
                Pošlji
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
