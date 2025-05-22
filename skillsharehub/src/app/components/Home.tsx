'use client'



/// v eventu odstrani stolpec lecturer pa pridobivaj iz foreign key uporabnika, ime tutorja





import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import VideoPreview from '@/app/components/VideoPreview';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react'
import { format, startOfWeek, addDays, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { sl } from 'date-fns/locale';

// Define types based on your database schema
type Uporabnik = {
  id: number
  Ime: string
  Priimek: string
  email: string
  tutor?: boolean
}

type Predmet = {
  id: number
  naziv: string
}

type Event = {
  id: number
  fk_id_uporabnik: number
  day_of_week: string
  start_date_time: string // Matches Supabase timestamp field
  end_date_time: string   // Matches Supabase timestamp field
  title: string
  description: string
  lecturer: string
  fk_id_predmet?: number
  predmet_naziv?: string
}

export default function Home() {
  const [users, setUsers] = useState<Uporabnik[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [predmeti, setPredmeti] = useState<Predmet[]>([])
  const [selectedPredmet, setSelectedPredmet] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Calculate the days of the current week
  const weekDays = Array.from({ length: 5 }).map((_, index) => addDays(currentWeekStart, index));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('Uporabniki')
        .select('*')
      
      if (userError) {
        console.error('User fetch error:', userError)
      } else {
        setUsers(userData as Uporabnik[])
      }
      
      // Fetch predmeti (subjects)
      const { data: predmetiData, error: predmetiError } = await supabase
        .from('Predmeti')
        .select('*')
      
      if (predmetiError) {
        console.error('Predmeti fetch error:', predmetiError)
      } else {
        setPredmeti(predmetiData as Predmet[])
      }
      
      // Fetch events with joins to get predmet name
      const { data: eventData, error: eventError } = await supabase
        .from('Event')
        .select(`
          *,
          predmet:fk_id_predmet (id, naziv)
        `)
      
      if (eventError) {
        console.error('Event fetch error:', eventError)
      } else {
        // Transform the data to match our updated Event type
        const formattedEvents = eventData.map(event => ({
          id: event.id,
          fk_id_uporabnik: event.fk_id_uporabnik,
          day_of_week: format(parseISO(event.start_date_time), 'EEEE', { locale: sl }), // Generate day from datetime
          start_date_time: event.start_date_time,
          end_date_time: event.end_date_time,
          title: event.title || 'Predavanje',
          description: event.description || 'Opis ni na voljo',
          lecturer: event.lecturer || 'Predavatelj',//spremenit na id od uporabnika za ime
          fk_id_predmet: event.predmet?.id,
          predmet_naziv: event.predmet?.naziv
        }))
        
        setEvents(formattedEvents)
        setFilteredEvents(formattedEvents)
      }
      
      setLoading(false)
    }

    fetchData()
  }, [])

    // Filter events when selected predmet changes or when week changes
  useEffect(() => {
    // Get the end date of the current displayed week
    const weekEnd = addDays(currentWeekStart, 4); // Friday (5 days total)
    
    // Filter events that fall within the current week
    const eventsInWeek = events.filter(event => {
      const eventDate = parseISO(event.start_date_time);
      return isWithinInterval(eventDate, { 
        start: currentWeekStart,
        end: addDays(weekEnd, 1) // Including the end day fully
      });
    });
    
    // Then apply the predmet filter if selected
    if (selectedPredmet === null) {
      setFilteredEvents(eventsInWeek);
    } else {
      setFilteredEvents(eventsInWeek.filter(event => event.fk_id_predmet === selectedPredmet));
    }
  }, [selectedPredmet, events, currentWeekStart])

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedPredmet(value === "" ? null : parseInt(value))
  }

  // Handle week navigation
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }

  // Format date for display
  const formatDateHeader = (date: Date) => {
    return (
      <>
        <div className="font-bold">{format(date, 'EEEE', { locale: sl })}</div>
        <div className="text-sm">{format(date, 'd. MMMM', { locale: sl })}</div>
      </>
    );
  }

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
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Tedenski Urnik</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-center">
            Tukaj lahko najdeš naš tedenski urnik z delavnicami, predavanji in urjenji.
          </p>
          
          {/* Week navigation */}
          <div className="mb-4 flex justify-center items-center space-x-4">
            <button 
              onClick={goToPreviousWeek}
              className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="text-center">
              <p className="font-medium">
                {format(currentWeekStart, 'd. MMMM', { locale: sl })} - {format(addDays(currentWeekStart, 4), 'd. MMMM yyyy', { locale: sl })}
              </p>
              <button 
                onClick={goToCurrentWeek}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline mt-1"
              >
                Pojdi na trenutni teden
              </button>
            </div>
            
            <button 
              onClick={goToNextWeek}
              className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Filter */}
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-xs">
              <label htmlFor="predmet-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filtriraj po predmetu:
              </label>
              <select
                id="predmet-filter"
                onChange={handleFilterChange}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Vsi predmeti</option>
                {predmeti.map((predmet) => (
                  <option key={predmet.id} value={predmet.id}>
                    {predmet.naziv}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Nalaganje urnika...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weekDays.map((day) => {
                // Filter events for this specific day of the week
                const dayEvents = filteredEvents.filter(event => {
                  const eventDate = parseISO(event.start_date_time);
                  return isSameDay(eventDate, day);
                });
                
                // Sort events by start time
                dayEvents.sort((a, b) => 
                  parseISO(a.start_date_time).getTime() - parseISO(b.start_date_time).getTime()
                );
                
                // Check if this day is today
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={format(day, 'yyyy-MM-dd')} className="flex flex-col">
                    <h3 className={`font-bold text-lg text-center p-2 rounded-t-lg ${isToday ? 'bg-orange-300' : 'bg-orange-200'}`}>
                      {formatDateHeader(day)}
                    </h3>
                    <div className="flex-grow bg-orange-50 rounded-b-lg p-2 min-h-48">
                      {dayEvents.length > 0 ? (
                        dayEvents.map((event) => (
                          <div 
                            key={event.id} 
                            className="mb-3 bg-white p-3 rounded-lg shadow-sm border-l-4 border-orange-400 hover:shadow-md transition-shadow"
                          >
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-gray-700">{event.description}</p>
                            <p className="mt-1 text-sm italic">{event.lecturer}</p>
                            <div className="flex justify-between mt-1">
                              <p className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {format(parseISO(event.start_date_time), 'HH:mm')} - {format(parseISO(event.end_date_time), 'HH:mm')}
                              </p>
                              {event.predmet_naziv && (
                                <p className="text-xs bg-orange-100 px-2 py-1 rounded">
                                  {event.predmet_naziv}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 text-sm py-4">
                          Ni najdenih dogodkov
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* O SKILLHUBU */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl font-bold mb-4">O SkillHubu</h2>
        <p className="max-w-3xl mx-auto text-gray-600 mb-8">
          SkillHub je inovativna platforma, ki ti pomaga izboljšati študijske spretnosti in omogoča učenje skozi nove tehnike ter izmenjavo znanja znotraj študentske skupnosti.
        </p>
        
        {users.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-3">Naši tutorji</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {users
                .filter(user => user.tutor)
                .map((user) => (
                  <div key={user.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <p className="font-medium">{user.Ime} {user.Priimek}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
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