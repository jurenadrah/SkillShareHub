'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthForm() {
  // State za obrazec
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ime, setIme] = useState('');
  const [priimek, setPriimek] = useState('');
  const [tutor, setTutor] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

  // Spremljaj prijavljenega uporabnika
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Navadna registracija
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // 1. Supabase Auth sign up
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Dodaš v svojo tabelo Uporabniki
    const { error: dbError } = await supabase
      .from('Uporabniki')
      .insert([{ email, ime, priimek, tutor }]);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess('Registracija uspešna! Preveri email za potrditev.');
      // Reset form
      setEmail('');
      setPassword('');
      setIme('');
      setPriimek('');
      setTutor(false);
    }
    setLoading(false);
  };

  // Navadna prijava
  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error: logInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (logInError) {
      setError(logInError.message);
    }
    setLoading(false);
  };


  // Odjava
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSuccess('');
    setError('');
  };


  return (
    <div className="max-w-md w-full mx-auto bg-white rounded shadow p-6 mt-8">
      {user ? (
        <div className="flex flex-col items-center gap-3">
          <span className="text-green-600 font-bold">Prijavljen kot {user.email}</span>
          <button
            onClick={signOut}
            className="bg-orange-200 rounded px-4 py-2 hover:bg-orange-300"
          >
            Odjava
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm underline text-indigo-600"
            >
              {mode === 'login'
                ? 'Nimaš računa? Registriraj se'
                : 'Imaš račun? Prijava'}
            </button>
          </div>
          <form
            onSubmit={mode === 'login' ? handleLogIn : handleSignUp}
            className="space-y-3"
          >
            {mode === 'signup' && (
              <>
                <input
                  type="text"
                  placeholder="Ime"
                  value={ime}
                  onChange={e => setIme(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Priimek"
                  value={priimek}
                  onChange={e => setPriimek(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                
                {/* Tutor selection for normal registration */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tip računa:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="signup-student"
                        name="signupUserType"
                        checked={!tutor}
                        onChange={() => setTutor(false)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <label htmlFor="signup-student" className="text-sm text-gray-700">
                        Dijak/Študent - Iščem pomoč pri učenju
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="signup-tutor"
                        name="signupUserType"
                        checked={tutor}
                        onChange={() => setTutor(true)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <label htmlFor="signup-tutor" className="text-sm text-gray-700">
                        Tutor - Ponujam pomoč pri učenju
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Geslo"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
              disabled={loading}
            >
              {loading
                ? mode === 'login'
                  ? 'Prijavljam...'
                  : 'Registriram...'
                : mode === 'login'
                ? 'Prijava'
                : 'Registracija'}
            </button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </form>
        </>
      )}
    </div>
  );
}