# SkillShareHub 🌐🤝

**Spletna platforma za izmenjavo veščin — učiš, da se učiš.**

SkillShareHub je platforma, ki povezuje posameznike, ki želijo deliti in graditi znanja. Uporabniki lahko ponudijo učenje ene veščine v zameno za drugo, pri tem pa uporabljajo integriran sistem terminov, video klicev in točk, ki zagotavlja pravično izmenjavo.

---

## 🚀 Ključne funkcionalnosti

- 🔍 **Iskanje po interesih in lokaciji**
- 🧩 **Skill-for-Skill sistem izmenjave**
- 📆 **Koledar in upravljanje terminov**
- 🎥 **Video srečanja prek Zooma**
- ⚖️ **Točkovni sistem pravičnosti**
- ⭐ **Ocenjevanje in sledenje napredku**

---

## 🧠 Komu je namenjeno?

- 🎓 Študentom
- 📚 Samoukom
- 🧑‍💻 Posameznikom, ki želijo brezplačno nadgraditi svoje veščine

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

1. **Kloniraj repozitorij**
   ```bash
   git clone https://github.com/your-username/skillsharehub.git
   cd skillsharehub
    ````

2. **Namesti odvisnosti**

   ```bash
   npm install
   ```

3. **Konfiguriraj okolje**
   Ustvari `.env.local` datoteko in dodaj naslednje vrednosti:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ZOOM_API_KEY=your_zoom_api_key
   ZOOM_API_SECRET=your_zoom_api_secret
   ```

---

## ▶️ Zagon rešitve

Zagon lokalnega razvojnega strežnika:

```bash
npm run dev
```

Aplikacija bo dostopna na [http://localhost:3000](http://localhost:3000)

---

## 🧩 Kako deluje sistem izmenjave veščin?

### 1. 🔐 Uporabniški profil

* Navedi veščine, ki jih ponujaš
* Navedi veščine, ki se jih želiš naučiti
* Določi časovno razpoložljivost in lokacijo (po želji)

### 2. 🧠 Matching sistem

* Sistem poveže uporabnike z dopolnjujočimi se znanji
* Filtri: jezik, lokacija, izkušnje

### 3. 📅 Seje izmenjave

* Predlagaj in sprejmi termine
* Video srečanja preko Zooma
* Beleženje sejn in napredka

### 4. ⚖️ Sistem točk

* Poučevanje → zaslužiš točke
* Učenje → porabiš točke
* Uravnotežena in poštena izmenjava

### 5. ⭐ Ocenjevanje in napredek

* Ocenjevanje po seji
* Sledenje napredku in povratnim informacijam

---

## 👥 Ekipa

* **Larisa Gragar** – [larisa.gragar@student.um.si](mailto:larisa.gragar@student.um.si)
* **Jure Nadrah** – [jure.nadrah@student.um.si](mailto:jure.nadrah@student.um.si)
* **Izidor Robnik** – [izidor.robnik@student.um.si](mailto:izidor.robnik@student.um.si)
---