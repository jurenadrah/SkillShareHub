'use client';
import React, { useEffect, useState } from 'react';
import styles from './playbook.module.css';

interface Topic {
  subject: string;
  categories: string[];
}

const topics: Topic[] = [
  {
    subject: 'Matematika',
    categories: ['Kvadratne enačbe', 'Derivacije', 'Integrali', 'Trigonometrija', 'Logaritmi'],
  },
  {
    subject: 'Programiranje',
    categories: ['Spremenljivke', 'Funkcije', 'Zanke', 'OOP', 'API-ji'],
  },
  {
    subject: 'Informacijski sistemi',
    categories: ['ER modeli', 'Normalizacija', 'UML diagrami', 'Relacijska baza', 'CRUD operacije'],
  },
];

export default function PlaybookPage() {
  const [selectedSubject, setSelectedSubject] = useState(topics[0].subject);
  const [selectedCategory, setSelectedCategory] = useState(topics[0].categories[0]);
  const [question, setQuestion] = useState('');
  const [solution, setSolution] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExercise = async () => {
    setIsLoading(true);
    setError(null);
    setUserAnswer('');
    setIsCorrect(null);
    
    try {
      // Tukaj dejansko pokličite vaš API endpoint
      const response = await fetch('/api/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject: selectedSubject,
          category: selectedCategory,
          difficulty: 'medium' // Lahko dodate težavnost
        }),
      });

      if (!response.ok) {
        throw new Error('Napaka pri generiranju naloge');
      }

      const data = await response.json();
      
      if (!data.question || !data.solution) {
        throw new Error('API je vrnil nepopolne podatke');
      }

      setQuestion(data.question);
      setSolution(data.solution);
    } catch (err) {
      setError('Prišlo je do napake pri generiranju naloge. Poskusite znova.');
      console.error('API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateExercise();
  }, [selectedSubject, selectedCategory]);

  const checkAnswer = () => {
    // Bolj fleksibilno preverjanje odgovora
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedSolution = solution.trim().toLowerCase();
    
    setIsCorrect(normalizedUserAnswer === normalizedSolution);
  };

  const handleNewExercise = () => {
    generateExercise();
  };

  return (
    <div className={styles.playbookContainer}>
      <aside className={styles.sidebar}>
        <h2>Predmeti</h2>
        <ul>
          {topics.map((topic) => (
            <li
              key={topic.subject}
              className={selectedSubject === topic.subject ? styles.active : ''}
              onClick={() => {
                setSelectedSubject(topic.subject);
                setSelectedCategory(topic.categories[0]);
              }}
            >
              {topic.subject}
            </li>
          ))}
        </ul>

        <h3>Kategorije</h3>
        <ul>
          {topics
            .find((t) => t.subject === selectedSubject)
            ?.categories.map((cat) => (
              <li
                key={cat}
                className={selectedCategory === cat ? styles.active : ''}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
        </ul>
      </aside>

      <main className={styles.content}>
        <h1>{selectedSubject} – {selectedCategory}</h1>

        {isLoading && <p className={styles.loading}>Generiram nalogo...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!isLoading && !error && question && (
          <div className={styles.exerciseBox}>
            <div className={styles.questionHeader}>
              <h2>Naloga</h2>
              <button 
                onClick={handleNewExercise}
                className={styles.newExerciseBtn}
              >
                Nova naloga
              </button>
            </div>
            
            <p className={styles.questionText}>{question}</p>
            
            <div className={styles.answerSection}>
              <input
                type="text"
                placeholder="Vpiši odgovor..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isCorrect === true}
                className={styles.answerInput}
              />
              
              <div className={styles.buttonGroup}>
                <button 
                  onClick={checkAnswer} 
                  className={styles.checkBtn}
                  disabled={!userAnswer.trim()}
                >
                  Preveri
                </button>
              </div>
            </div>

            {isCorrect !== null && (
              <div className={styles.feedback}>
                {isCorrect ? (
                  <div className={styles.correct}>
                    <span>✅ Pravilno!</span>
                    <button 
                      onClick={handleNewExercise}
                      className={styles.nextBtn}
                    >
                      Naslednja naloga
                    </button>
                  </div>
                ) : (
                  <span className={styles.incorrect}>❌ Napačno, poskusi znova</span>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}