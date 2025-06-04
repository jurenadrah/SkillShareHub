'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter(); // <-- tukaj je manjkalo

  const handlePlayMore = () => {
    router.push('/playbook');
  };

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      <Image
        src="/main_photo.jpg"
        width={1200}
        height={600}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
        alt="Hero background"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/30">
        <h1 className="text-5xl font-bold mb-4">SkillShareHub</h1>
        <button 
          onClick={handlePlayMore}
          className="mt-4 bg-white text-black px-4 py-2 text-sm rounded hover:opacity-90 transition-opacity"
        >
          ➤ Rešuj interaktivne naloge
        </button>
      </div>
    </section>
  );
}
