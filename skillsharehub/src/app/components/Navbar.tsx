import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AuthForm from './AuthForm';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setShowAuthModal(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="flex space-x-6">
          <a href="#">About</a>
          <a href="#">Learning Tools</a>
          <a href="#">Online Courses</a>
          <a href="#">Contact</a>
        </div>
        <div className="text-xl font-bold mr-auto ml-71">📷 SkillShareHub</div>
        <div className="flex space-x-4 items-center">
          <span>🔔</span>
          <span>👤</span>
          <span>📘</span>
          <span>🐦</span>
          <span>▶️</span>
          {user ? (
            <>
              <span className="text-sm text-gray-700 ml-2">Pozdravljen, {user.email}</span>
              <button
                onClick={signOut}
                className="ml-2 px-3 py-1 bg-orange-200 rounded hover:bg-orange-300 transition"
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
              >
                Prijava / Registracija
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MODAL ZA AUTH */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center 
          backdrop-blur-sm backdrop-brightness-75">
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-white rounded shadow-lg p-6 relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-gray-600"
                title="Zapri"
                type="button"
              >
                ×
              </button>
              <AuthForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}