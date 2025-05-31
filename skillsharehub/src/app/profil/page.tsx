'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import StudentProfile from '@/app/components/StudentProfile';
import TutorProfile from '@/app/components/TutorProfile';


type Uporabnik = {
  id: number
  ime: string
  priimek: string
  email: string
  tutor: boolean
}

export default function ProfilPage() {
  const [uporabnik, setUporabnik] = useState<Uporabnik | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'student' | 'tutor' | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('Uporabniki')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error || !data) {
        console.error(error);
        setLoading(false);
        return;
      }

      setUporabnik(data);
      setSelectedView(data.tutor ? 'tutor' : 'student');
      setLoading(false);
    }

    fetchUser();
  }, [router]);

  // ✅ Add the toggleUserRole function
const toggleUserRole = async () => {
  if (!uporabnik) return;

  const newRole = !uporabnik.tutor;

  const { error } = await supabase
    .from('Uporabniki')
    .update({ tutor: newRole })
    .eq('id', uporabnik.id);

  if (!error) {
    const { data: updatedUser } = await supabase
      .from('Uporabniki')
      .select('*')
      .eq('id', uporabnik.id)
      .single();

    setUporabnik(updatedUser);
    setSelectedView(newRole ? 'tutor' : 'student');
  } else {
    console.error("Napaka pri posodabljanju vloge:", error);
  }
};

  if (loading) return <p>Nalaganje...</p>;
  if (!uporabnik) return <p>Napaka pri nalaganju profila.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header z izbiro pogleda */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Profil - {uporabnik.ime} {uporabnik.priimek}
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
          
          <div className="mt-2 text-sm text-gray-600">
            {uporabnik.tutor ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Registriran kot tutor
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Registriran kot učenec
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dinamična vsebina */}
      <div className="max-w-7xl mx-auto">
        {selectedView === 'student' ? (
          <StudentProfile />
        ) : (
          <TutorProfile />
        )}
      </div>
    </div>
  );
}