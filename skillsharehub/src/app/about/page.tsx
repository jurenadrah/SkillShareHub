import Image from 'next/image';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      <h1 className={styles.aboutTitle}>O nas – SkillShareHub</h1>

      <div className={styles.contentBlock}>
        <div className={styles.imageWrapper}>
          <Image
            src="/slikaAbout1.webp"
            alt="Skupnost dijakov in študentov"
            width={400}
            height={250}
            className={styles.aboutImage}
          />
        </div>
        <div className={styles.textWrapper}>
          <h2 className={styles.sectionTitle}>Skupnost znanja</h2>
          <p className={styles.aboutText}>
  <strong>SkillShareHub</strong> je platforma, ki povezuje mlade – radovedne ume, ki si želijo učiti in biti
  učeni. Verjamemo, da ima vsak posameznik nekaj, kar lahko deli z drugimi. Ker se zavedamo, da ni vsak posameznik za vse, smo ustvarili platformo,
  kjer si lahko uporabniki to znanje delijo. Naš cilj je omogočiti varno, dostopno in vključujoče okolje za učenje.
</p>

        </div>
      </div>

      <div className={`${styles.contentBlock} ${styles.reverse}`}>
        <div className={styles.imageWrapper}>
          <Image
            src="/slikaAbout2.webp"
            alt="Mentorstvo in sodelovanje"
            width={400}
            height={250}
            className={styles.aboutImage}
          />
        </div>
        <div className={styles.textWrapper}>
          <h2 className={styles.sectionTitle}>Povezovanje uporabnikov</h2>
          <p className={styles.aboutText}>
  SkillShareHub omogoča, da se tisti, ki imajo znanje, povežejo z drugimi, ki si želijo tega znanja. Mentorstvo,
  sodelovanje in vzajemno učenje so v središču naše skupnosti. Tudi dijaki in študenti imajo možnost deliti znanje z drugimi, ki potrebujejo pomoč,
  v zameno pa se tudi sami naučijo nekaj novega. Tako gradimo mrežo sodelovanja in medsebojne podpore.
</p>

        </div>
      </div>

      <div className={styles.contentBlock}>
        <div className={styles.imageWrapper}>
          <Image
            src="/slikaAbout3.webp"
            alt="Skupinsko učenje"
            width={400}
            height={250}
            className={styles.aboutImage}
          />
        </div>
        <div className={styles.textWrapper}>
          <h2 className={styles.sectionTitle}>Učenje, ki združuje</h2>
         <p className={styles.aboutText}>
  Učenje je lahko zabavno, dostopno in povezovalno. V SkillShareHub-u ni pomembno, ali obvladaš matematiko, programiranje
  ali umetnost – vsak prispeva svoj delček znanja in gradi celoto. Omogoča povezovanje z drugimi ne glede od kod so.
  Skupno učenje postane navdihujoča izkušnja, ki bogati vse udeležence.
</p>

        </div>
      </div>

      <div className={`${styles.contentBlock} ${styles.reverse}`}>
        <div className={styles.imageWrapper}>
          <Image
            src="/about4.webp"
            alt="Učimo se skupaj"
            width={400}
            height={250}
            className={styles.aboutImage}
          />
        </div>
        <div className={styles.textWrapper}>
          <h2 className={styles.sectionTitle}>Ustvarjamo priložnosti</h2>
        <p className={styles.aboutText}>
  Želimo si, da SkillShareHub ni zgolj platforma, temveč gibanje – gibanje, ki mladim omogoča osebni in strokovni razvoj,
  samozavestno deljenje znanja ter navezovanje trajnih poznanstev. Vsak dobi priložnost deliti nekaj z drugimi, z enostavnim usklajevanjem urnikov. Vse poteka digitalno, a s pristnim človeškim stikom.
</p>

        </div>
      </div>
   <div className="bg-[#2a2a2a] mt-12 py-4 px-4 flex items-center justify-between">
    <img src="/logo.png" alt="Logo" className="h-15" />
  </div>
<section className="bg-[#1e1e1e] text-white pt-16 pb-8">
  
  <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
    {/* Left Column - Contact Info */}
    <div>
      <h3 className="text-xl font-bold mb-4">Kontakt</h3>
      <p className="mb-1">123-456-7890</p>
      <p className="mb-6">info@skillsharehub.com</p>
      
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Nikoli ne zamudi predavanja.</h4>
        <form className="flex flex-col space-y-2">
          <input
            type="email"
            placeholder="Email *"
            className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
            required
          />
          <label className="flex items-center text-sm">
            <input 
              type="checkbox" 
              className="mr-2 rounded text-orange-500 focus:ring-orange-300 bg-white" 
            />
            Da, želim prejemati obvestila.
          </label>
          <button 
            type="submit"
            className="bg-orange-300 text-black font-semibold px-4 py-2 rounded w-fit hover:bg-orange-400 transition-colors"
          >
            Naroči se
          </button>
        </form>
      </div>
    </div>

    {/* Right Column - Contact Form */}
    <div>
      <h3 className="text-xl font-bold mb-4">Vprašaj nas karkoli</h3>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Ime *"
            className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
            required
          />
          <input
            type="text"
            placeholder="Priimek *"
            className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
            required
          />
        </div>
        <input
          type="email"
          placeholder="Email *"
          className="p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
          required
        />
        <input
          type="text"
          placeholder="Zadeva"
          className="p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <textarea
          placeholder="Sporočilo..."
          className="p-2 rounded w-full h-24 bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
        ></textarea>
        <button 
          type="submit"
          className="bg-orange-300 text-black font-semibold px-6 py-2 rounded hover:bg-orange-400 transition-colors"
        >
          Pošlji
        </button>
      </form>
    </div>
  </div>
  <div className=" mt-12 py-4 px-4 flex flex-col items-center justify-center text-center">
  <p className="text-sm text-gray-400">
    &copy; {new Date().getFullYear()} SkillShareHub. Vse pravice pridržane.
  </p>
</div>
</section>
    </div>
  );
}
