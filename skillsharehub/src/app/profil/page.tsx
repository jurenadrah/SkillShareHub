// src/app/profil/page.tsx
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfilRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login'); // ali druga stran za prijavo
        return;
      }

      const { data, error } = await supabase
        .from('uporabniki')
        .select('tutor')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.error(error);
        return;
      }

      if (data.tutor) {
        router.push('/tutor');
      } else {
        router.push('/student');
      }
    }

    redirectUser();
  }, [router]);

  return <p>Preusmerjam na profil...</p>;
}
