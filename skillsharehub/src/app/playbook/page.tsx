'use client';
import React, { useState, useEffect } from 'react';
import styles from './playbook.module.css';

interface Topic {
  subject: string;
  categories: string[];
}

interface Exercise {
  question: string;
  solution: string;
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
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Auto-generate first exercise on component mount
  useEffect(() => {
    generateExercise();
  }, []);

  const generateExercise = async () => {
    setIsLoading(true);
    setError(null);
    setUserAnswer('');
    setIsCorrect(null);
    setShowSolution(false);
    setDebugInfo('Starting exercise generation...');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // Reduced timeout

      setDebugInfo(`Generating for: ${selectedSubject} - ${selectedCategory}`);

      const response = await fetch('/api/hf-api', {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Ustvari konkretno šolsko nalogo iz predmeta ${selectedSubject} 
                  na temo ${selectedCategory} v slovenskem jeziku. 
                  Naloga naj bo primerna za srednješolce in naj ima jasno rešitev.`
        }),
      });

      clearTimeout(timeout);
      setDebugInfo(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        setDebugInfo(`API error: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.error || "Napaka pri generiranju naloge");
      }

      const data = await response.json();
      setDebugInfo(`Received data: ${JSON.stringify(data)}`);

      // Validate the received data
      if (!data.question || !data.solution) {
        throw new Error("Invalid exercise data received");
      }

      // Check if we got a meaningful question (not just the prompt)
      if (data.question.includes('Ustvari nalogo iz predmeta') || 
          data.question.length < 10) {
        console.log("Received invalid question, using predefined exercise");
        loadPredefinedExercise();
        return;
      }

      const newExercise: Exercise = {
        question: data.question,
        solution: data.solution
      };

      setCurrentExercise(newExercise);
      setDebugInfo('Exercise successfully generated!');

    } catch (error: any) {
      console.error("Generation Error:", error);
      const errorMessage = error.name === 'AbortError' 
        ? "Zahtevek je potekel. Poskusi znova."
        : (error instanceof Error ? error.message : "Napaka pri generiranju naloge");
      
      setError(errorMessage);
      setDebugInfo(`Error: ${errorMessage}`);
      
      // Always load a predefined exercise as fallback
      loadPredefinedExercise();
      
    } finally {
      setIsLoading(false);
    }
  };

  const loadPredefinedExercise = () => {
    const predefinedExercises = {
      'Matematika': {
        'Kvadratne enačbe': {
          question: 'Reši kvadratno enačbo: x² - 7x + 12 = 0',
          solution: 'x₁ = 3, x₂ = 4 (uporabi faktorizacijo: (x-3)(x-4) = 0)'
        },
        'Derivacije': {
          question: 'Poišči odvod funkcije f(x) = 3x² + 2x - 5',
          solution: "f'(x) = 6x + 2"
        },
        'Integrali': {
          question: 'Izračunaj nedoločeni integral ∫(2x + 3)dx',
          solution: '∫(2x + 3)dx = x² + 3x + C'
        },
        'Trigonometrija': {
          question: 'Izračunaj sin(30°) + cos(60°)',
          solution: 'sin(30°) = 1/2, cos(60°) = 1/2, torej 1/2 + 1/2 = 1'
        },
        'Logaritmi': {
          question: 'Reši enačbo log₂(x) = 3',
          solution: 'x = 2³ = 8'
        }
      },
      'Programiranje': {
        'Spremenljivke': {
          question: 'Kaj je razlika med let, const in var v JavaScriptu?',
          solution: 'let - blokovni doseg, spremenljiva vrednost; const - blokovni doseg, nespremenljiva vrednost; var - funkcijski doseg, spremenljiva vrednost'
        },
        'Funkcije': {
          question: 'Napiši funkcijo v Pythonu, ki vrne vsoto dveh števil',
          solution: 'def vsota(a, b):\n    return a + b'
        },
        'Zanke': {
          question: 'Napiši for zanko v Pythonu, ki izpiše števila od 1 do 5',
          solution: 'for i in range(1, 6):\n    print(i)'
        },
        'OOP': {
          question: 'Kaj je dedovanje v objektno-usmerjenem programiranju?',
          solution: 'Dedovanje omogoča razredu, da podeduje lastnosti in metode od nadrejenega (parent) razreda, kar omogoča ponovno uporabo kode.'
        },
        'API-ji': {
          question: 'Kako poslati GET zahtevo z JavaScript fetch()?',
          solution: 'fetch("https://api.example.com/data")\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error("Error:", error))'
        }
      },
      'Informacijski sistemi': {
        'ER modeli': {
          question: 'Kaj je entiteta v ER modelu in navedi primer?',
          solution: 'Entiteta je določena stvar ali objekt, ki ga lahko razločimo od drugih stvari in ima lastne atribute. Primer: ŠTUDENT z atributi (ime, priimek, vpisna_številka).'
        },
        'Normalizacija': {
          question: 'Kaj je prva normalna forma (1NF) in zakaj je pomembna?',
          solution: 'Tabela je v 1NF, če vsaka celica vsebuje samo eno atomsko (nedeljivo) vrednost in ni ponavljajočih se skupin. Pomembna je za odpravo redundance podatkov.'
        },
        'UML diagrami': {
          question: 'Kaj prikazuje razredni diagram v UML in katere elemente vsebuje?',
          solution: 'Razredni diagram prikazuje strukturo sistema z razredi, njihovimi atributi, metodami in razmerji (asociacije, dedovanje, agregacija) med njimi.'
        },
        'Relacijska baza': {
          question: 'Napiši SQL poizvedbo za izbor vseh študentov iz mesta Ljubljana',
          solution: 'SELECT * FROM studenti WHERE mesto = "Ljubljana";'
        },
        'CRUD operacije': {
          question: 'Kaj pomeni CRUD in pokaži primer za vsako operacijo v SQL?',
          solution: 'CRUD = Create (INSERT INTO tabela VALUES...), Read (SELECT * FROM tabela), Update (UPDATE tabela SET...), Delete (DELETE FROM tabela WHERE...)'
        }
      }
    };

    const exercise = predefinedExercises[selectedSubject]?.[selectedCategory];
    if (exercise) {
      setCurrentExercise(exercise);
      setError(null);
      setDebugInfo('Loaded predefined exercise');
    } else {
      // Ultimate fallback
      setCurrentExercise({
        question: `Opišite osnovne koncepte teme "${selectedCategory}" v okviru predmeta ${selectedSubject}.`,
        solution: "Poizkusite sistematično obravnavati to temo. Če potrebujete pomoč, se posvetujte z učiteljem."
      });
      setDebugInfo('Loaded generic fallback exercise');
    }
  };

  const checkAnswer = () => {
    if (!currentExercise || !userAnswer.trim()) return;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');

    const normalizedSolution = currentExercise.solution.trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');

    const isAnswerCorrect = normalizedUserAnswer === normalizedSolution ||
                           normalizedSolution.includes(normalizedUserAnswer) ||
                           normalizedUserAnswer.includes(normalizedSolution);

    setIsCorrect(isAnswerCorrect);
    
    if (!isAnswerCorrect) {
      setTimeout(() => {
        if (isCorrect === false) {
          setShowSolution(true);
        }
      }, 3000);
    }
  };

  const handleSubjectChange = (newSubject: string) => {
    setSelectedSubject(newSubject);
    const newCategories = topics.find(t => t.subject === newSubject)?.categories || [];
    setSelectedCategory(newCategories[0] || '');
    setDebugInfo('');
    generateExercise();
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setDebugInfo('');
    generateExercise();
  };

  const handleNewExercise = () => {
    setDebugInfo('');
    generateExercise();
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer.trim() && !isLoading) {
      checkAnswer();
    }
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
              onClick={() => handleSubjectChange(topic.subject)}
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
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </li>
            ))}
        </ul>

        {/* Debug section - remove in production */}
        {debugInfo && (
          <div className={styles.debugSection}>
            <h4>Debug Info:</h4>
            <p className={styles.debugText}>{debugInfo}</p>
          </div>
        )}
      </aside>

      <main className={styles.content}>
        <h1>{selectedSubject} – {selectedCategory}</h1>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Generiram nalogo...</p>
            <p className={styles.loadingSubtext}>To lahko traja do 30 sekund</p>
            {debugInfo && <p className={styles.debugText}>{debugInfo}</p>}
          </div>
        )}
        
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <div className={styles.errorActions}>
              <button onClick={handleNewExercise} className={styles.retryButton}>
                Poskusi znova
              </button>
              <button onClick={loadPredefinedExercise} className={styles.fallbackButton}>
                Naloži pripravljeno nalogo
              </button>
              <button 
                onClick={() => setError(null)} 
                className={styles.dismissButton}
              >
                Skrij napako
              </button>
            </div>
          </div>
        )}

        {!isLoading && currentExercise && (
          <div className={styles.exerciseBox}>
            <div className={styles.questionHeader}>
              <h2>Naloga</h2>
              <div className={styles.exerciseActions}>
                <button 
                  onClick={handleNewExercise}
                  className={styles.newExerciseBtn}
                  disabled={isLoading}
                >
                  Nova naloga
                </button>
                {!showSolution && (
                  <button 
                    onClick={handleShowSolution}
                    className={styles.showSolutionBtn}
                    disabled={isLoading}
                  >
                    Prikaži rešitev
                  </button>
                )}
              </div>
            </div>
            
            <p className={styles.questionText}>{currentExercise.question}</p>
            
            <div className={styles.answerSection}>
              <input
                type="text"
                placeholder="Vpiši odgovor..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCorrect === true}
                className={`${styles.answerInput} ${
                  isCorrect === true ? styles.correct : 
                  isCorrect === false ? styles.incorrect : ''
                }`}
              />
              
              <div className={styles.buttonGroup}>
                <button 
                  onClick={checkAnswer} 
                  className={styles.checkBtn}
                  disabled={!userAnswer.trim() || isLoading || isCorrect === true}
                >
                  Preveri
                </button>
              </div>
            </div>

            {isCorrect !== null && (
              <div className={styles.feedback}>
                {isCorrect ? (
                  <div className={styles.correctFeedback}>
                    <span className={styles.correctIcon}>✅ Pravilno!</span>
                    <button 
                      onClick={handleNewExercise}
                      className={styles.nextBtn}
                      disabled={isLoading}
                    >
                      Naslednja naloga
                    </button>
                  </div>
                ) : (
                  <div className={styles.incorrectFeedback}>
                    <span className={styles.incorrectIcon}>❌ Napačno</span>
                    <p>Poskusi znova ali si oglej rešitev.</p>
                  </div>
                )}
              </div>
            )}

            {showSolution && (
              <div className={styles.solutionBox}>
                <h3>Rešitev:</h3>
                <p className={styles.solutionText}>{currentExercise.solution}</p>
                <button 
                  onClick={handleNewExercise}
                  className={styles.nextBtn}
                  disabled={isLoading}
                >
                  Naslednja naloga
                </button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && !currentExercise && (
          <div className={styles.welcomeBox}>
            <h2>Dobrodošli!</h2>
            <p>Izberi predmet in kategorijo za začetek reševanja nalog.</p>
            <button 
              onClick={generateExercise}
              className={styles.generateBtn}
              disabled={isLoading}
            >
              Generiraj prvo nalogo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}