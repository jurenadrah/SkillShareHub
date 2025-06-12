import Image from 'next/image';
import styles from './about.module.css';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
  <>
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

    </div>
      <Footer />
  </>
  );
}
