'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ime, setIme] = useState('');
  const [priimek, setPriimek] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Insert into 'Uporabniki' with tutor: false by default
    const { error: dbError } = await supabase
      .from('Uporabniki')
      .insert([{ email, ime, priimek, tutor: false }]);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess('Registracija uspešna! Preveri email za potrditev.');
      setEmail('');
      setPassword('');
      setIme('');
      setPriimek('');
    }

    setLoading(false);
  };

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
              {mode === 'login' ? 'Nimaš računa? Registriraj se' : 'Imaš račun? Prijava'}
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
