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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-10">
      {/* Logo and Header */}
      <div className="flex flex-row items-center mb-8 gap-4">
        <div className="w-24 h-24 relative">
          <img
            src="/logo.png"
            alt="SkillShareHub Logo"
            className="h-full w-auto"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">
          {mode === 'login' ? 'Prijava' : 'Registracija'}
        </h2>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-6">
          <span className="text-green-600 font-bold text-xl">Prijavljen kot {user.email}</span>
          <button
            onClick={signOut}
            className="bg-orange-400 text-black font-bold text-lg rounded-xl px-8 py-3 hover:bg-orange-500 transition-colors shadow-lg"
          >
            Odjava
          </button>
        </div>
      ) : (
        <>
          <form
            onSubmit={mode === 'login' ? handleLogIn : handleSignUp}
            className="space-y-6"
          >
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <label className="block text-gray-700 text-lg">Ime</label>
                  <input
                    type="text"
                    placeholder="Vnesite svoje ime"
                    value={ime}
                    onChange={e => setIme(e.target.value)}
                    className="w-full p-3 text-black text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-700 text-lg">Priimek</label>
                  <input
                    type="text"
                    placeholder="Vnesite svoj priimek"
                    value={priimek}
                    onChange={e => setPriimek(e.target.value)}
                    className="w-full p-3 text-black text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400"
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="block text-gray-700 text-lg">Email</label>
              <input
                type="email"
                placeholder="Vnesite svoj email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 text-black text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700 text-lg">Geslo</label>
              <input
                type="password"
                placeholder="Vnesite svoje geslo"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 text-black text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-400"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-orange-400 text-black font-bold text-xl py-4 rounded-xl hover:bg-orange-500 transition-colors shadow-lg"
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
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-lg text-orange-500 hover:text-orange-600 font-medium underline"
            >
              {mode === 'login'
                ? 'Nimaš računa? Registriraj se'
                : 'Imaš račun? Prijavi se'}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 text-lg">
              {success}
            </div>
          )}
        </>
      )}
    </div>
  );
}
