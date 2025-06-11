'use client'
import React, { useEffect, useState } from 'react'
import styles from './playbook.module.css'

const topics = [
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
]

export default function PlaybookPage() {
  const [selectedSubject, setSelectedSubject] = useState(topics[0].subject)
  const [selectedCategory, setSelectedCategory] = useState(topics[0].categories[0])
  const [question, setQuestion] = useState('')
  const [solution, setSolution] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

  const generateExercise = async () => {
    setIsLoading(true)
    setError(null)
    setUserAnswer('')
    setIsCorrect(null)
    setApiStatus('pending')
    
    try {
      // Preverimo, ali API endpoint sploh obstaja
      const apiUrl = '/api/generate-exercise'
      const pingResponse = await fetch(apiUrl, { method: 'HEAD' })
      
      if (!pingResponse.ok) {
        throw new Error('API endpoint ni dosegljiv. Preverite, ali route obstaja.')
      }

    const response = await fetch('/api/generate-exercise', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: selectedSubject,
    category: selectedCategory,
    difficulty: 'medium',
  }),
});


      // Dodatno preverjanje za netipične odzive
      if (response.status === 404) {
        throw new Error('API endpoint ni bil najden (404)')
      }

      if (response.status === 500) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Napaka na strežniku')
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Neveljaven odgovor od strežnika')
      }

      const data = await response.json()
      
      if (!data.question || !data.solution) {
        console.error('Neveljavni podatki:', data)
        throw new Error('Strežnik je vrnil nepopolne podatke')
      }

      setQuestion(data.question)
      setSolution(data.solution)
      setApiStatus('success')
    } catch (err) {
      setApiStatus('error')
      const errorMessage = err instanceof Error ? err.message : 'Neznana napaka'
      setError(`Prišlo je do napake: ${errorMessage}`)
      
      // Fallback na ročno generiranje naloge če API ne deluje
      setQuestion(`Primer naloge za ${selectedCategory} v ${selectedSubject}`)
      setSolution('Primer rešitve')
      console.error('API klical ni uspel:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateExercise()
  }, [selectedSubject, selectedCategory])

  const checkAnswer = () => {
    if (!userAnswer.trim()) return
    
    // Bolj fleksibilno preverjanje odgovora
    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedSolution = solution.trim().toLowerCase()
    
    setIsCorrect(normalizedUserAnswer === normalizedSolution)
  }

  const handleNewExercise = () => {
    generateExercise()
  }

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
                setSelectedSubject(topic.subject)
                setSelectedCategory(topic.categories[0])
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
        
        <div className={styles.apiStatus} data-status={apiStatus}>
          Stanje API-ja: {apiStatus}
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Generiram nalogo...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <p>Uporabljam začasno rešitev z osnovnimi nalogami.</p>
          </div>
        ) : (
          <div className={styles.exerciseBox}>
            <div className={styles.questionHeader}>
              <h2>Naloga</h2>
              <button 
                onClick={handleNewExercise}
                className={styles.newExerciseBtn}
                disabled={isLoading}
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
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                disabled={isCorrect === true}
                className={styles.answerInput}
              />
              
              <button 
                onClick={checkAnswer} 
                className={styles.checkBtn}
                disabled={!userAnswer.trim() || isLoading}
              >
                Preveri
              </button>
            </div>

            {isCorrect !== null && (
              <div className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
                {isCorrect ? (
                  <>
                    <span>✅ Pravilno!</span>
                    <button 
                      onClick={handleNewExercise}
                      className={styles.nextBtn}
                    >
                      Naslednja naloga
                    </button>
                  </>
                ) : (
                  <span>❌ Napačno, poskusi znova</span>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}