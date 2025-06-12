# SkillShareHub 🌐🤝

**Spletna platforma za izmenjavo veščin — učiš, da se učiš.**

SkillShareHub je platforma, kjer lahko vsakdo deli in pridobiva nova znanja na enakopraven, preprost in motivirajoč način. Verjamemo, da ima vsak posameznik uporabno veščino, ki jo lahko deli z drugimi – zato gradimo most med ljudmi, ki želijo učiti in ljudmi, ki želijo napredovati.


<p align="center">
  <a href="https://skill-share-hub-skillsharehubs-projects-a282906b.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🌍 Obišči%20SkillShareHub%20spletno%20stran%20-%20KLIKNI%20TUKAJ-blue?style=for-the-badge&logo=google-chrome" alt="Obišči spletno stran SkillShareHub" />
  </a>
</p>

---


## 🧠 Komu je namenjeno?

- 🎓 Študentom
- 📚 Samoukom
- 🧑‍💻 Posameznikom, ki želijo brezplačno nadgraditi svoje veščine

---

## 🚀 Ključne funkcionalnosti

- 🔍 **Izbira po interesih**
- 🧩 **Skill-for-Skill sistem izmenjave**
- 📆 **Koledar in upravljanje terminov**
- 🎥 **Video srečanja prek Zooma**
- ⚖️ **Točkovni sistem pravičnosti**
- ⭐ **Ocenjevanje in sledenje napredku**

---

## 🧩 Kako deluje sistem izmenjave veščin?

### 1. 🔐 Uporabniški profil

* Navedi veščine, ki jih ponujaš
* Napiši nekaj o sebi 🙂

### 2. 📅 Seje izmenjave

* Predlagaj in sprejmi termine
* Video srečanja preko Zooma
* Beleženje sejn in napredka

### 3. ⚖️ Sistem točk

* Poučevanje → zaslužiš točke
* Učenje → porabiš točke
* Uravnotežena in poštena izmenjava

### 4. ⭐ Ocenjevanje in napredek

* Ocenjevanje po seji
* Sledenje napredku in povratnim informacijam

---

## 🛠️ Tehnologije

| Tehnologija         | Namen                                |
|---------------------|---------------------------------------|
| **Next.js** | Frontend       |
| **Supabase**         | Avtentikacija, podatkovna baza       |
| **Tailwind CSS**     | Oblikovanje vmesnika                 |
| **Zoom**         | Video srečanja                       |
| **Vercel**           | Hosting in CI/CD                     |

---

## ⚙️ Vzpostavitev razvojnega okolja
1. **Namesti Node.js in npm**
   - Obišči [https://nodejs.org/](https://nodejs.org/) in prenesi  različico za svoj operacijski sistem.
   - **Priporočena verzija**: Node.js v24.0.2, npm 11.3.0
   - Po namestitvi preveri, če sta Node.js in npm uspešno nameščena:
     ```bash
     node -v
     npm -v
     ```

2. **Namesti Git**
   - Prenesi in namesti Git z [https://git-scm.com/downloads](https://git-scm.com/downloads).
   - Preveri namestitev:
     ```bash
     git --version
     ```

3. **Kloniraj repozitorij**
   ```bash
   git clone https://github.com/your-username/skillsharehub.git
   cd skillsharehub
    ````

4. **Namesti odvisnosti**

   ```bash
   npm install
   ```

5. **Konfiguriraj okolje**
   Ustvari `.env.local` datoteko in dodaj naslednje vrednosti:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

---

## ▶️ Zagon rešitve

Zagon lokalnega razvojnega strežnika:

```bash
npm run dev
```

Aplikacija bo dostopna na [http://localhost:3000](http://localhost:3000)

---


## 👥 Ekipa

* **Larisa Gragar** – [larisa.gragar@student.um.si](mailto:larisa.gragar@student.um.si)
* **Jure Nadrah** – [jure.nadrah@student.um.si](mailto:jure.nadrah@student.um.si)
* **Izidor Robnik** – [izidor.robnik@student.um.si](mailto:izidor.robnik@student.um.si)
---

Dostop do projekta na DockerHub: https://hub.docker.com/r/frucek1234/skillsharehub
