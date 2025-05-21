'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthForm() {
  // State za obrazec
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ime, setIme] = useState('');
  const [priimek, setPriimek] = useState('');
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
      if (session?.user) {
        handleProfile(session.user);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  // Google prijava/registracija
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

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
      .insert([{ email, ime, priimek }]);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess('Registracija uspešna! Preveri email za potrditev.');
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

  // Sinhronizacija uporabnika v tabelo Uporabniki (za Google prijavo)
  const handleProfile = async (authUser: any) => {
    if (!authUser) return;
    const { data: existing } = await supabase
      .from('Uporabniki')
      .select('*')
      .eq('email', authUser.email)
      .single();

    if (!existing) {
      // Ime in priimek iz Google profila
      const fullName = authUser.user_metadata?.full_name || '';
      const [ime, ...priimekArr] = fullName.split(' ');
      const priimek = priimekArr.join(' ');
      await supabase.from('Uporabniki').insert([
        {
          email: authUser.email,
          ime: ime || '',
          priimek: priimek || '',
        },
      ]);
    }
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
          <div className="mb-4 flex justify-center">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              {loading ? 'Povezujem...' : 'Prijava z Google'}
            </button>
          </div>
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
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
          </form>
        </>
      )}
    </div>
  );
}