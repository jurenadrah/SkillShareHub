'use client';
import React, { useState, useEffect } from 'react';
import styles from './playbook.module.css';

interface Topic {
  subject: string;
  categories: string[];
}

interface Exercise {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateExercise = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowSolution(false);

    try {
      const response = await fetch('/api/hf-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Ustvari testno vprašanje z 4 možnimi odgovori (A, B, C, D) iz predmeta ${selectedSubject} 
                  na temo ${selectedCategory} v slovenskem jeziku. Vključi pravilen odgovor in razlago.
                  Format: 
                  Vprašanje: [vprašanje]
                  A) [možnost A]
                  B) [možnost B]
                  C) [možnost C]
                  D) [možnost D]
                  Pravilen odgovor: [črka pravilnega odgovora]
                  Razlaga: [razlaga]`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Napaka pri generiranju naloge");
      }

      const data = await response.json();
      
      if (!data.question || !data.options || data.options.length !== 4 || !data.correctAnswer || !data.explanation) {
        throw new Error("Neveljavna oblika generirane naloge");
      }

      setCurrentExercise(data);

    } catch (error: any) {
      console.error("Generation Error:", error);
      setError(error instanceof Error ? error.message : "Napaka pri generiranju naloge");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateExercise();
  }, [selectedSubject, selectedCategory]);

  const checkAnswer = (option: string) => {
    if (!currentExercise) return;
    
    setSelectedOption(option);
    const isCorrect = option === currentExercise.correctAnswer;
    setIsCorrect(isCorrect);
    
    if (!isCorrect) {
      setTimeout(() => {
        setShowSolution(true);
      }, 2000);
    }
  };

  const handleSubjectChange = (newSubject: string) => {
    const newCategories = topics.find(t => t.subject === newSubject)?.categories || [];
    const newCategory = newCategories[0] || '';
    setSelectedSubject(newSubject);
    setSelectedCategory(newCategory);
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
  };

  const handleNewExercise = () => {
    generateExercise();
  };

  const handleShowSolution = () => {
    setShowSolution(true);
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
      </aside>

      <main className={styles.content}>
        <h1>{selectedSubject} – {selectedCategory}</h1>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Generiram nalogo...</p>
          </div>
        )}
        
        {error && (
          <div className={styles.error}>
            <h3>Napaka pri generiranju naloge</h3>
            <p>{error}</p>
            <button 
              onClick={handleNewExercise}
              className={styles.retryButton}
            >
              Poskusi znova
            </button>
          </div>
        )}

        {!isLoading && !error && currentExercise && (
          <div className={styles.exerciseBox}>
            <div className={styles.questionHeader}>
              <h2>Vprašanje</h2>
              <button 
                onClick={handleNewExercise}
                className={styles.newExerciseBtn}
                disabled={isLoading}
              >
                Nova naloga
              </button>
            </div>
            
            <p className={styles.questionText}>{currentExercise.question}</p>
            
            <div className={styles.optionsContainer}>
              {currentExercise.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isSelected = selectedOption === optionLetter;
                let optionClass = styles.option;
                
                if (isSelected) {
                  optionClass += isCorrect 
                    ? ` ${styles.correctOption}`
                    : ` ${styles.incorrectOption}`;
                } else if (selectedOption && optionLetter === currentExercise.correctAnswer) {
                  optionClass += ` ${styles.correctOption}`;
                }

                return (
                  <button
                    key={optionLetter}
                    className={optionClass}
                    onClick={() => !selectedOption && checkAnswer(optionLetter)}
                    disabled={!!selectedOption || isLoading}
                  >
                    <span className={styles.optionLetter}>{optionLetter})</span>
                    <span className={styles.optionText}>{option}</span>
                  </button>
                );
              })}
            </div>

            {isCorrect !== null && (
              <div className={styles.feedback}>
                {isCorrect ? (
                  <div className={styles.correctFeedback}>
                    <span className={styles.correctIcon}>✅ Pravilno!</span>
                    <button 
                      onClick={handleNewExercise}
                      className={styles.nextBtn}
                    >
                      Naslednja naloga
                    </button>
                  </div>
                ) : (
                  <div className={styles.incorrectFeedback}>
                    <span className={styles.incorrectIcon}>❌ Napačno</span>
                    {!showSolution && (
                      <button 
                        onClick={handleShowSolution}
                        className={styles.solutionBtn}
                      >
                        Pokaži razlago
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {showSolution && (
              <div className={styles.solutionBox}>
                <h3>Razlaga:</h3>
                <p className={styles.solutionText}>{currentExercise.explanation}</p>
                <button 
                  onClick={handleNewExercise}
                  className={styles.nextBtn}
                >
                  Naslednja naloga
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}