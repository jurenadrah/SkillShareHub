import Image from 'next/image';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      <h1 className={styles.aboutTitle}>O nas – SkillShareHub</h1>

      <div className={styles.gallery}>
        <div className={styles.imageCard}>
          <Image
            src="/slikaAbout1.webp"
            alt="Skupnost dijakov in študentov"
            width={400}
            height={250}
            className={styles.aboutImage}
          />
        </div>
        <div className={styles.imageCard}>
          <Image
            src="/slikaAbout2.webp"
            alt="Mentorstvo in sodelovanje"
            width={400}
            height={250}
            className={styles.aboutImage}
          />
        </div>
        <div className={styles.imageCard}>
          <Image
            src="/slikaAbout3.webp"
            alt="Skupinsko učenje"
            width={400}
            height={250}
            className={styles.aboutImage}
          />
        </div>
      </div>

      <div className={styles.textSection}>
        <p className={styles.aboutText}>
          <strong>SkillShareHub</strong> je prostor, kjer se povezujejo radovedni um in odprto srce. Ustvarili smo
          skupnost za študente in dijake, ki verjamejo, da se znanje množi, ko ga delimo.
        </p>
        <p className={styles.aboutText}>
          Naša aplikacija omogoča enostavno povezovanje mladih, ki želijo učiti druge ali se sami naučiti nečesa novega.
        </p>
        <p className={styles.aboutText}>
          Ne glede na to, ali si mojstrica matematike, navdušenec nad programiranjem ali nekdo, ki želi deliti znanje o
          pisanju esejev – SkillShareHub je tukaj zate. Skupaj gradimo skupnost, kjer je učenje zabavno, dostopno in
          medsebojno.
        </p>
      </div>
    </div>
  );
}
