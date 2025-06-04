'use client';
import React, { useState } from 'react';
import styles from './playbook.module.css';

type Subject = {
  name: string;
  content: string;
  exercises?: { question: string; placeholder: string; solution: string }[];
};

const subjects: Subject[] = [
  {
    name: 'Matematika',
    content: `
- Kvadratna enačba: ax² + bx + c = 0
- Derivacije: f'(x) = lim(h->0) (f(x+h)-f(x))/h
- Integrali: ∫f(x)dx = F(x) + C
- Trigonometrija: sin²x + cos²x = 1
- Logaritmi: logₐ(xy) = logₐx + logₐy
    `,
    exercises: [
      {
        question: 'Izračunaj ničli enačbe: x² - 5x + 6 = 0',
        placeholder: 'Vpiši ničli ločeni z vejico (npr. 2,3)',
        solution: '2,3',
      },
    ],
  },
  {
    name: 'Programiranje',
    content: `
- Spremenljivke: let, const, var
- Funkcije: function ime(parametri) { ... }
- Zanke: for, while, do...while
- Objektno usmerjeno programiranje: razredi, dedovanje
- API-ji: REST, fetch(), axios
    `,
    exercises: [
      {
        question: 'Kaj bo izpisano?\n\nlet x = 5;\nif (x > 3) { console.log("večji"); }',
        placeholder: 'Vpiši izpis...',
        solution: 'večji',
      },
    ],
  },
  {
    name: 'Informacijski sistemi',
    content: `
- ER modeli: entiteta, atribut, relacija
- Normalizacija: 1NF, 2NF, 3NF
- UML diagrami: razredni, zaporedni
- Relacijska baza: tabele, primarni ključ, tuji ključ
- CRUD operacije: Create, Read, Update, Delete
    `,
    exercises: [
      {
        question: 'Katera normalna forma odstrani delno funkcionalno odvisnost?',
        placeholder: 'Vpiši obliko...',
        solution: '2NF',
      },
    ],
  },
];

export default function PlaybookPage() {
  const [selected, setSelected] = useState(subjects[0]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.playbookContainer}>
      <aside className={styles.sidebar}>
        <h2>Predmeti</h2>
        <ul>
          {subjects.map((subject) => (
            <li
              key={subject.name}
              className={subject.name === selected.name ? styles.active : ''}
              onClick={() => setSelected(subject)}
            >
              {subject.name}
            </li>
          ))}
        </ul>
      </aside>

      <main className={styles.content}>
        <h1>{selected.name}</h1>
        <pre>{selected.content}</pre>

        {selected.exercises && (
          <div className={styles.exercises}>
            <h2>Interaktivne naloge</h2>
            {selected.exercises.map((ex, index) => {
              const key = `${selected.name}-${index}`;
              const isCorrect = answers[key]?.trim() === ex.solution;
              return (
                <div key={key} className={styles.exerciseBox}>
                  <p>{ex.question}</p>
                  <input
                    type="text"
                    placeholder={ex.placeholder}
                    value={answers[key] || ''}
                    onChange={(e) => handleAnswerChange(key, e.target.value)}
                  />
                  <div className={styles.feedback}>
                    {answers[key] && (
                      isCorrect ? (
                        <span className={styles.correct}>✅ Pravilno!</span>
                      ) : (
                        <span className={styles.incorrect}>❌ Napačno</span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
