// app/api/hf-api/route.ts
import { NextResponse } from 'next/server';

// Predefined exercises to ensure we always have content
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
      solution: 'Dedovanje omogoča razredu, da podeduje lastnosti in metode od nadrejenega (parent) razreda, kar omogoča ponovno uporabo kode in hierarhično organizacijo razredov.'
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

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "Vhodni prompt ni veljaven niz." },
        { status: 400 }
      );
    }

    console.log("Received prompt:", prompt);

    // Extract subject and category from prompt
    const subjectMatch = prompt.match(/predmeta\s+([^na]+)/);
    const categoryMatch = prompt.match(/temo\s+([^v]+)/);
    
    let subject = subjectMatch?.[1]?.trim() || 'Matematika';
    const category = categoryMatch?.[1]?.trim() || 'osnovne naloge';

    // Map short subject names to full names
    const subjectMapping = {
      'M': 'Matematika',
      'P': 'Programiranje', 
      'I': 'Informacijski sistemi'
    };

    if (subjectMapping[subject]) {
      subject = subjectMapping[subject];
    }

    console.log("Extracted:", { subject, category });

    // First, try to get predefined exercise
    const predefinedExercise = getPredefinedExercise(subject, category);
    if (predefinedExercise) {
      console.log("Using predefined exercise");
      return NextResponse.json(predefinedExercise);
    }

    // Only try HF API if we have a valid API key
    if (process.env.HF_API_KEY) {
      try {
        const hfResult = await tryHuggingFaceAPI(subject, category);
        if (hfResult.success) {
          return NextResponse.json(hfResult.data);
        }
      } catch (error) {
        console.log("HF API failed, using fallback:", error);
      }
    }

    // Final fallback - create a generic exercise
    return NextResponse.json(createGenericExercise(subject, category));

  } catch (err: any) {
    console.error("General error:", err);
    
    // Even in error case, return a valid exercise
    return NextResponse.json({
      question: "Opišite osnovne koncepte izbrane teme.",
      solution: "Poizkusite sistematično navesti glavne točke in jih podrobneje razložiti."
    });
  }
}

function getPredefinedExercise(subject: string, category: string) {
  const subjectExercises = predefinedExercises[subject];
  if (subjectExercises && subjectExercises[category]) {
    return subjectExercises[category];
  }
  return null;
}

function createGenericExercise(subject: string, category: string) {
  const genericQuestions = {
    'Matematika': {
      'Kvadratne enačbe': 'Reši kvadratno enačbo: 2x² - 8x + 6 = 0',
      'Derivacije': 'Poišči odvod funkcije f(x) = x³ - 3x² + 2x',
      'Integrali': 'Izračunaj integral ∫(4x - 2)dx',
      'Trigonometrija': 'Izračunaj vrednost izraza sin²(30°) + cos²(30°)',
      'Logaritmi': 'Reši enačbo log₅(x) = 2'
    },
    'Programiranje': {
      'Spremenljivke': 'Razloži razliko med globalnimi in lokalnimi spremenljivkami',
      'Funkcije': 'Kaj je rekurzivna funkcija? Navedi primer.',
      'Zanke': 'Kdaj uporabimo while zanko namesto for zanke?',
      'OOP': 'Kaj je polimorfizem v objektno-usmerjenem programiranju?',
      'API-ji': 'Kaj je REST API in katere HTTP metode poznamo?'
    },
    'Informacijski sistemi': {
      'ER modeli': 'Kako modeliramo razmerje "many-to-many" v ER diagramu?',
      'Normalizacija': 'Kaj je druga normalna forma (2NF)?',
      'UML diagrami': 'Kaj je razlika med kompozicijo in agregacijo v UML?',
      'Relacijska baza': 'Napiši SQL poizvedbo z uporabo JOIN',
      'CRUD operacije': 'Kako implementiramo CRUD operacije v REST API?'
    }
  };

  const question = genericQuestions[subject]?.[category] || 
                  `Razloži osnovne koncepte teme "${category}" v okviru predmeta ${subject}.`;
  
  return {
    question,
    solution: "Poizkusite sistematično obravnavati to temo. Če potrebujete pomoč, se posvetujte z učiteljem ali dodatnimi viri."
  };
}

async function tryHuggingFaceAPI(subject: string, category: string) {
  const models = [
    "microsoft/DialoGPT-medium",
    "google/flan-t5-large", 
    "facebook/blenderbot-400M-distill"
  ];

  for (const modelName of models) {
    try {
      const result = await queryHuggingFaceModel(modelName, subject, category);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.log(`Model ${modelName} failed:`, error);
      continue;
    }
  }

  return { success: false, error: "All models failed" };
}

async function queryHuggingFaceModel(modelName: string, subject: string, category: string) {
  const HF_API_URL = `https://api-inference.huggingface.co/models/${modelName}`;
  
  const prompt = `Create a school exercise in Slovenian language:
Subject: ${subject}
Topic: ${category}
Format: Question and solution separated by [SOLUTION]`;

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        do_sample: true,
      },
      options: {
        wait_for_model: true,
        use_cache: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  let generatedText = "";
  
  if (Array.isArray(result)) {
    generatedText = result[0]?.generated_text || "";
  } else if (result.generated_text) {
    generatedText = result.generated_text;
  }

  if (!generatedText || generatedText.length < 20) {
    throw new Error("Generated text too short");
  }

  // Parse the generated text
  const exercise = parseGeneratedText(generatedText, subject, category);
  
  return {
    success: true,
    data: exercise
  };
}

function parseGeneratedText(text: string, subject: string, category: string) {
  // Remove the original prompt from generated text
  text = text.replace(/Create a school exercise.*Format: Question and solution separated by \[SOLUTION\]/i, '').trim();
  
  let question = "";
  let solution = "";

  // Try to split by [SOLUTION] marker
  if (text.includes('[SOLUTION]')) {
    const parts = text.split('[SOLUTION]');
    question = parts[0].trim();
    solution = parts[1]?.trim() || "Poizkusite rešiti samostojno.";
  } else {
    // Use the first meaningful sentence as question
    const sentences = text.split(/[.!?]\s+/);
    question = sentences[0]?.trim() || "";
    solution = "Poizkusite rešiti samostojno.";
  }

  // Validate and clean up
  if (!question || question.length < 10) {
    return createGenericExercise(subject, category);
  }

  return { question, solution };
}