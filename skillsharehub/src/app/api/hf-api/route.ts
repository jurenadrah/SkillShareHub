import { NextResponse } from 'next/server';

interface Exercise {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SubjectExercises {
  [category: string]: Exercise[];
}

interface FallbackExercises {
  [subject: string]: SubjectExercises;
}

// Nato definirajte FALLBACK_EXERCISES s tem tipom
const FALLBACK_EXERCISES: FallbackExercises = {
  'Matematika': {
    'Kvadratne enačbe': [
      {
        question: "Katera izmed naslednjih je kvadratna enačba?",
        options: [
          "2x + 5 = 11",
          "x² - 4x + 4 = 0", 
          "3x³ - 2x = 7",
          "sin(x) = 0.5"
        ],
        correctAnswer: "B",
        explanation: "Kvadratna enačba vsebuje člen x² in nima višjih potenc."
      },
      {
        question: "Koliko realnih rešitev ima enačba x² + 1 = 0?",
        options: [
          "0",
          "1",
          "2",
          "neskončno"
        ],
        correctAnswer: "A",
        explanation: "Enačba nima realnih rešitev, ker je x² vedno nenegativen."
      },
      {
        question: "Reši enačbo: x² - 9 = 0",
        options: [
          "x = 0",
          "x = ±3",
          "x = 9",
          "x = ±9"
        ],
        correctAnswer: "B",
        explanation: "Enačbo lahko zapišemo kot (x-3)(x+3)=0, torej x=3 ali x=-3."
      },
      {
        question: "Katera metoda je najprimernejša za reševanje x² + 6x + 9 = 0?",
        options: [
          "Razstavljanje",
          "Kvadratna formula",
          "Dopolnjevanje do popolnega kvadrata",
          "Vse naštete metode"
        ],
        correctAnswer: "D",
        explanation: "To je popolni kvadrat (x+3)²=0, vendar vse metode vodijo do pravilne rešitve."
      },
      {
        question: "Reši enačbo: 2x² - 8x = 0",
        options: [
          "x = 0",
          "x = 4",
          "x = 0 ali x = 4",
          "x = 0 ali x = 8"
        ],
        correctAnswer: "C",
        explanation: "Enačbo lahko zapišemo kot 2x(x-4)=0, torej x=0 ali x=4."
      },
      {
        question: "Koliko je diskriminanta enačbe x² - 5x + 6 = 0?",
        options: [
          "1",
          "-1",
          "25",
          "49"
        ],
        correctAnswer: "A",
        explanation: "D = b² - 4ac = 25 - 24 = 1"
      },
      {
        question: "Kaj je rešitev enačbe x² + 4x + 4 = 0?",
        options: [
          "x = 2",
          "x = -2",
          "x = 2 ali x = -2",
          "Nima realnih rešitev"
        ],
        correctAnswer: "B",
        explanation: "To je popolni kvadrat (x+2)²=0 z dvojno rešitvijo x=-2."
      },
      {
        question: "Katera kvadratna enačba ima rešitvi x=1 in x=-3?",
        options: [
          "x² - 2x - 3 = 0",
          "x² + 2x - 3 = 0",
          "x² + 3x - 1 = 0",
          "x² - 3x + 1 = 0"
        ],
        correctAnswer: "B",
        explanation: "Enačbo dobimo kot (x-1)(x+3)=0 → x² + 2x - 3 = 0"
      },
      {
        question: "Kaj je vsota rešitev enačbe 2x² - 10x + 12 = 0?",
        options: [
          "5",
          "6",
          "10",
          "12"
        ],
        correctAnswer: "A",
        explanation: "Po Vietovih formulah je vsota rešitev -b/a = 10/2 = 5."
      },
      {
        question: "Kaj je produkt rešitev enačbe x² - 7x + 10 = 0?",
        options: [
          "7",
          "10",
          "-7",
          "-10"
        ],
        correctAnswer: "B",
        explanation: "Po Vietovih formulah je produkt rešitev c/a = 10/1 = 10."
      },
      {
        question: "Katera izmed naslednjih kvadratnih enačb nima realnih rešitev?",
        options: [
          "x² - 4 = 0",
          "x² + 4 = 0",
          "x² - 4x + 4 = 0",
          "x² - 5x + 6 = 0"
        ],
        correctAnswer: "B",
        explanation: "Diskriminanta D = 0 - 16 = -16 < 0, torej ni realnih rešitev."
      },
      {
        question: "Reši enačbo: 3x² - 12 = 0",
        options: [
          "x = ±2",
          "x = ±√12",
          "x = ±4",
          "x = ±√3"
        ],
        correctAnswer: "A",
        explanation: "3x² = 12 → x² = 4 → x = ±2"
      },
      {
        question: "Katera vrednost parametra k naredi enačbo x² + kx + 9 = 0 popolnim kvadratom?",
        options: [
          "3",
          "6",
          "9",
          "12"
        ],
        correctAnswer: "B",
        explanation: "Popolni kvadrat zahteva k² = 4ac → k² = 36 → k = ±6"
      },
      {
        question: "Kaj je rešitev enačbe (x-3)² = 16?",
        options: [
          "x = 19",
          "x = -13",
          "x = 7 ali x = -1",
          "x = 3 ± 4"
        ],
        correctAnswer: "C",
        explanation: "x-3 = ±4 → x = 3±4 → x=7 ali x=-1"
      },
      {
        question: "Katera izmed naslednjih je rešitev enačbe x² + x - 6 = 0?",
        options: [
          "1",
          "2",
          "-3",
          "6"
        ],
        correctAnswer: "B",
        explanation: "2² + 2 - 6 = 0, torej x=2 je rešitev (druga rešitev je x=-3)."
      },
      {
        question: "Katera izmed naslednjih je kvadratna formula?",
        options: [
          "x = -b ± √(b² - ac) / 2a",
          "x = -b ± √(b² - 4ac) / a",
          "x = -b ± √(b² - 4ac) / 2a",
          "x = b ± √(b² + 4ac) / 2a"
        ],
        correctAnswer: "C",
        explanation: "To je pravilna kvadratna formula za reševanje ax² + bx + c = 0."
      },
      {
        question: "Kaj predstavlja diskriminanta kvadratne enačbe?",
        options: [
          "Vsoto rešitev",
          "Produkt rešitev",
          "Število realnih rešitev",
          "Vrednost ene od rešitev"
        ],
        correctAnswer: "C",
        explanation: "Diskriminanta D = b² - 4ac določa število realnih rešitev."
      },
      {
        question: "Katera vrednost parametra m naredi enačbo mx² - 6x + 3 = 0 linearno?",
        options: [
          "0",
          "1",
          "3",
          "6"
        ],
        correctAnswer: "A",
        explanation: "Ko je m=0, enačba postane -6x + 3 = 0, kar je linearna enačba."
      },
      {
        question: "Katera izmed naslednjih je popolni kvadrat?",
        options: [
          "x² + 5x + 10",
          "x² - 6x + 9",
          "x² + 7x + 12",
          "x² - 8x + 15"
        ],
        correctAnswer: "B",
        explanation: "x² - 6x + 9 = (x-3)² je popolni kvadrat."
      },
      {
        question: "Kaj je geometrijski pomen rešitev kvadratne enačbe?",
        options: [
          "Presečišče parabole z osjo x",
          "Presečišče parabole z osjo y",
          "Vrh parabole",
          "Ničelni točki funkcije"
        ],
        correctAnswer: "A",
        explanation: "Rešitve kvadratne enačbe so točke, kjer parabola seka x-os."
      }
    ],
 'Derivacije': [
  {
    question: "Kaj je odvod funkcije f(x) = 5?",
    options: ["5", "5x", "0", "ni določen"],
    correctAnswer: "C",
    explanation: "Odvod konstante je vedno 0."
  },
  {
    question: "Kaj je odvod funkcije f(x) = 3x²?",
    options: ["3x", "6x", "6x²", "9x"],
    correctAnswer: "B",
    explanation: "Po pravilih odvajanja je odvod x^n enak n*x^(n-1)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = sin(x)?",
    options: ["cos(x)", "-cos(x)", "tan(x)", "-sin(x)"],
    correctAnswer: "A",
    explanation: "Odvod sin(x) je cos(x)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = x³?",
    options: ["3x²", "x²", "3x", "x³"],
    correctAnswer: "A",
    explanation: "Odvod x³ je 3x²."
  },
  {
    question: "Kaj je odvod funkcije f(x) = ln(x)?",
    options: ["1/x", "ln(x)", "x", "1"],
    correctAnswer: "A",
    explanation: "Odvod ln(x) je 1/x."
  },
  {
    question: "Kaj je odvod funkcije f(x) = e^x?",
    options: ["x*e^x", "e^x", "ln(x)", "1/x"],
    correctAnswer: "B",
    explanation: "Odvod e^x je e^x."
  },
  {
    question: "Kaj je odvod funkcije f(x) = x⁴ + 2x²?",
    options: ["4x³ + 4x", "4x³ + 2x", "2x + 8x³", "x³ + x"],
    correctAnswer: "B",
    explanation: "Odvod vsakega člena posebej: 4x³ + 4x."
  },
  {
    question: "Kaj je odvod f(x) = cos(x)?",
    options: ["-cos(x)", "-sin(x)", "sin(x)", "1"],
    correctAnswer: "B",
    explanation: "Odvod cos(x) je -sin(x)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = tan(x)?",
    options: ["sec²(x)", "cos²(x)", "-sin(x)", "1"],
    correctAnswer: "A",
    explanation: "Odvod tan(x) je sec²(x)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = √x?",
    options: ["1/√x", "1/(2√x)", "2√x", "√x/2"],
    correctAnswer: "B",
    explanation: "Odvod √x je 1/(2√x)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = 1/x?",
    options: ["-1/x²", "1/x²", "ln(x)", "0"],
    correctAnswer: "A",
    explanation: "Odvod 1/x je -1/x²."
  },
  {
    question: "Kaj je odvod funkcije f(x) = x * sin(x)?",
    options: ["x*cos(x)", "sin(x)", "x*cos(x) + sin(x)", "x*sin(x)"],
    correctAnswer: "C",
    explanation: "Uporabimo pravilo za produkt: f' = x*cos(x) + sin(x)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = (x² + 1)³?",
    options: ["3(x² + 1)²", "6x(x² + 1)²", "3(x² + 1)² * 2x", "ni določeno"],
    correctAnswer: "C",
    explanation: "Z verižnim pravilom: 3(x² + 1)² * 2x."
  },
  {
    question: "Kaj je odvod funkcije f(x) = ln(x²)?",
    options: ["1/x²", "2/x", "ln(2x)", "1/x"],
    correctAnswer: "B",
    explanation: "Z verižnim pravilom: odvod ln(x²) je 2/x."
  },
  {
    question: "Kaj je odvod funkcije f(x) = e^(2x)?",
    options: ["2e^x", "e^(2x)", "2e^(2x)", "ln(2x)"],
    correctAnswer: "C",
    explanation: "Z verižnim pravilom: odvod e^(2x) je 2e^(2x)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = x / (x + 1)?",
    options: [
      "1/(x + 1)",
      "1/(x + 1)²",
      "1/(x² + 1)",
      "1 / x"
    ],
    correctAnswer: "B",
    explanation: "Uporabimo kvocientno pravilo."
  },
  {
    question: "Kaj je odvod funkcije f(x) = ln(sin(x))?",
    options: ["cos(x)/sin(x)", "1/sin(x)", "-sin(x)", "cos(x)"],
    correctAnswer: "A",
    explanation: "Odvod ln(f(x)) je f'(x)/f(x), torej cos(x)/sin(x) = cot(x)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = |x|?",
    options: ["1", "-1", "0", "ni definiran v 0"],
    correctAnswer: "D",
    explanation: "Odvod absolutne vrednosti ni definiran v točki 0."
  },
  {
    question: "Kaj je odvod funkcije f(x) = arctan(x)?",
    options: ["1/(1+x²)", "-1/(1+x²)", "arcsin(x)", "ln(x)"],
    correctAnswer: "A",
    explanation: "Odvod arctan(x) je 1/(1 + x²)."
  },
  {
    question: "Kaj je odvod funkcije f(x) = ln(e^x)?",
    options: ["e^x", "x", "ln(x)", "1"],
    correctAnswer: "D",
    explanation: "ln(e^x) = x, torej je odvod enak 1."
   }
    ],

    'Integrali': [
  {
    question: "Kaj je ∫2x dx?",
    options: ["x²", "x² + C", "2x²", "2x² + C"],
    correctAnswer: "B",
    explanation: "Integral 2x je x² plus integracijska konstanta C."
  },
  {
    question: "Kaj je ∫cos(x) dx?",
    options: ["sin(x)", "sin(x) + C", "-sin(x)", "-sin(x) + C"],
    correctAnswer: "B",
    explanation: "Integral cos(x) je sin(x) plus konstanta."
  },
  {
    question: "Kaj je ∫x dx?",
    options: ["0.5x² + C", "x + C", "x² + C", "1 + C"],
    correctAnswer: "A",
    explanation: "Integral x je 0.5x² plus konstanta."
  },
  {
    question: "Kaj je ∫e^x dx?",
    options: ["e^x + C", "e^x", "x*e^x + C", "ln(x) + C"],
    correctAnswer: "A",
    explanation: "Integral e^x je e^x + C."
  },
  {
    question: "Kaj je ∫1/x dx?",
    options: ["ln|x| + C", "1/x + C", "x + C", "x² + C"],
    correctAnswer: "A",
    explanation: "Integral 1/x je ln|x| + C."
  },
  {
    question: "Kaj je ∫sin(x) dx?",
    options: ["-cos(x) + C", "cos(x)", "sin(x)", "-sin(x) + C"],
    correctAnswer: "A",
    explanation: "Integral sin(x) je -cos(x) + C."
  },
  {
    question: "Kaj je ∫0 dx?",
    options: ["0", "C", "x", "x + C"],
    correctAnswer: "D",
    explanation: "Integral 0 je konstanta, torej x + C."
  },
  {
    question: "Kaj je ∫3 dx?",
    options: ["3x + C", "x + C", "3 + C", "x^3 + C"],
    correctAnswer: "A",
    explanation: "Integral konstante je konstanta krat x plus C."
  },
  {
    question: "Kaj je ∫x^3 dx?",
    options: ["x^4/4 + C", "3x^2 + C", "x^3 + C", "4x^3 + C"],
    correctAnswer: "A",
    explanation: "Povečamo eksponent za 1 in delimo z njim."
  },
  {
    question: "Kaj je ∫sec^2(x) dx?",
    options: ["tan(x) + C", "cot(x) + C", "sec(x) + C", "-tan(x) + C"],
    correctAnswer: "A",
    explanation: "Standardna formula: ∫sec^2(x) = tan(x) + C."
  },
  {
    question: "Kaj je ∫1/(1+x^2) dx?",
    options: ["arctan(x) + C", "arcsin(x) + C", "ln|x| + C", "x + C"],
    correctAnswer: "A",
    explanation: "To je definicija odvoda arctan(x)."
  },
  {
    question: "Kaj je ∫|x| dx?",
    options: ["(1/2)x|x| + C", "x + C", "x|x| + C", "|x| + C"],
    correctAnswer: "A",
    explanation: "Uporabi se deljenje funkcije."
  },
  {
    question: "Kaj je ∫1 dx?",
    options: ["x + C", "1 + C", "C", "0"],
    correctAnswer: "A",
    explanation: "Integral konstante 1 je x + C."
  },
  {
    question: "Kaj je ∫tan(x) dx?",
    options: ["-ln|cos(x)| + C", "ln|sec(x)| + C", "tan(x) + C", "cos(x) + C"],
    correctAnswer: "A",
    explanation: "Standardna formula za integral tan(x)."
  },
  {
    question: "Kaj je ∫sec(x)tan(x) dx?",
    options: ["sec(x) + C", "tan(x) + C", "ln|sec(x)| + C", "cos(x) + C"],
    correctAnswer: "A",
    explanation: "Integral sec(x)tan(x) je sec(x) + C."
  },
  {
    question: "Kaj je ∫1/(a^2 + x^2) dx?",
    options: ["(1/a) arctan(x/a) + C", "arcsin(x) + C", "ln|x| + C", "1/x + C"],
    correctAnswer: "A",
    explanation: "Standardna formula za integral rationalne funkcije."
  },
  {
    question: "Kaj je ∫sinh(x) dx?",
    options: ["cosh(x) + C", "sinh(x) + C", "e^x + C", "x + C"],
    correctAnswer: "A",
    explanation: "Odvod sinh(x) je cosh(x), zato je to integral."
  },
  {
    question: "Kaj je ∫cosh(x) dx?",
    options: ["sinh(x) + C", "cosh(x) + C", "e^x + C", "x + C"],
    correctAnswer: "A",
    explanation: "Odvod cosh(x) je sinh(x), zato je to integral."
  },
  {
    question: "Kaj je ∫1/(x^2 + 1) dx?",
    options: ["arctan(x) + C", "ln|x| + C", "x + C", "1/x + C"],
    correctAnswer: "A",
    explanation: "Integral je arctan(x) + C."
  },
  {
    question: "Kaj je ∫arcsin(x) dx?",
    options: ["x*arcsin(x) + √(1-x^2) + C", "arcsin(x) + C", "ln|x| + C", "x + C"],
    correctAnswer: "A",
    explanation: "Uporabi integracijo po delih."
  }
],
   'Trigonometrija': [
  {
    question: "Koliko je sin(30°)?",
    options: ["0.5", "√3/2", "1", "0"],
    correctAnswer: "A",
    explanation: "Standardna vrednost trigonometrične funkcije."
  },
  {
    question: "Koliko je cos(π)?",
    options: ["0", "0.5", "1", "-1"],
    correctAnswer: "D",
    explanation: "cos(π) = -1 po enotskem krogu."
  },
  {
    question: "Koliko je tan(45°)?",
    options: ["1", "√3", "0", "0.5"],
    correctAnswer: "A",
    explanation: "tan(45°) = 1 po definiciji tangensa."
  },
  {
    question: "Kaj je sin²(x) + cos²(x)?",
    options: ["1", "0", "tan(x)", "sin(x)"],
    correctAnswer: "A",
    explanation: "Temeljna trigonometrična identiteta: sin²(x) + cos²(x) = 1."
  },
  {
    question: "Koliko je cot(π/4)?",
    options: ["1", "0", "√3", "2"],
    correctAnswer: "A",
    explanation: "cot(π/4) = 1, ker je obrat tangensa."
  },
  {
    question: "Koliko je sin(0)?",
    options: ["0", "1", "-1", "nedoločen"],
    correctAnswer: "A",
    explanation: "sin(0) = 0."
  },
  {
    question: "Koliko je cos(0)?",
    options: ["1", "0", "-1", "nedoločen"],
    correctAnswer: "A",
    explanation: "cos(0) = 1."
  },
  {
    question: "Koliko je tan(0)?",
    options: ["0", "1", "-1", "nedoločen"],
    correctAnswer: "A",
    explanation: "tan(0) = 0."
  },
  {
    question: "Kaj je obratna funkcija sin(x)?",
    options: ["arcsin(x)", "cos(x)", "tan(x)", "cot(x)"],
    correctAnswer: "A",
    explanation: "Obratna funkcija sinusa je arcsin."
  },
  {
    question: "Kaj pomeni π radianov?",
    options: ["180°", "90°", "360°", "0°"],
    correctAnswer: "A",
    explanation: "π rad = 180°."
  },
  {
    question: "Kaj je enotski krog?",
    options: ["Krog s polmerom 1", "Krog s polmerom π", "Polni krog", "Polkrog"],
    correctAnswer: "A",
    explanation: "Enotski krog ima polmer 1."
  },
  {
    question: "Koliko je sin(90°)?",
    options: ["1", "0", "-1", "√3/2"],
    correctAnswer: "A",
    explanation: "sin(90°) = 1."
  },
  {
    question: "Koliko je cos(90°)?",
    options: ["0", "1", "-1", "√2/2"],
    correctAnswer: "A",
    explanation: "cos(90°) = 0."
  },
  {
    question: "Koliko je tan(π)?",
    options: ["0", "1", "nedoločen", "-1"],
    correctAnswer: "A",
    explanation: "tan(π) = 0."
  },
  {
    question: "Kaj je osnovna domena funkcije tan(x)?",
    options: ["x ≠ π/2 + kπ", "x ≠ 0", "x ≠ π", "x ∈ ℝ"],
    correctAnswer: "A",
    explanation: "Tan(x) ni definiran za x = π/2 + kπ."
  },
  {
    question: "Kaj je sec(x)?",
    options: ["1/cos(x)", "1/sin(x)", "1/tan(x)", "cos(x)"],
    correctAnswer: "A",
    explanation: "Secans je obratna funkcija cosinusa."
  },
  {
    question: "Kaj je csc(x)?",
    options: ["1/sin(x)", "1/cos(x)", "1/tan(x)", "sin(x)"],
    correctAnswer: "A",
    explanation: "Cosecans je obratna funkcija sinusa."
  },
  {
    question: "Koliko je sin(π/2)?",
    options: ["1", "0", "-1", "√3/2"],
    correctAnswer: "A",
    explanation: "sin(π/2) = 1."
  },
  {
    question: "Koliko je cos(π/2)?",
    options: ["0", "1", "-1", "√2/2"],
    correctAnswer: "A",
    explanation: "cos(π/2) = 0."
  },
  {
    question: "Koliko je sin(2x) po identiteti?",
    options: ["2sin(x)cos(x)", "sin²(x) + cos²(x)", "1 - cos²(x)", "cos(2x)"],
    correctAnswer: "A",
    explanation: "sin(2x) = 2sin(x)cos(x)."
  }
],
   'Logaritmi': [
  {
    question: "Koliko je log₁₀(100)?",
    options: ["1", "2", "10", "100"],
    correctAnswer: "B",
    explanation: "Ker je 10^2 = 100."
  },
  {
    question: "Koliko je ln(e³)?",
    options: ["1", "3", "e³", "0"],
    correctAnswer: "B",
    explanation: "ln(e³) = 3 po definiciji naravnega logaritma."
  },
  {
    question: "Kaj je log₁₀(1)?",
    options: ["0", "1", "10", "-1"],
    correctAnswer: "A",
    explanation: "log₁₀(1) = 0, ker je 10^0 = 1."
  },
  {
    question: "Koliko je ln(1)?",
    options: ["0", "1", "e", "-1"],
    correctAnswer: "A",
    explanation: "ln(1) = 0."
  },
  {
    question: "Kaj pomeni logₐ(b)?",
    options: ["Potenco a, ki da b", "log b + log a", "b^a", "a^b"],
    correctAnswer: "A",
    explanation: "logₐ(b) pomeni, katera potenca števila a je enaka b."
  },
  {
    question: "Koliko je log₁₀(1000)?",
    options: ["3", "2", "1", "0"],
    correctAnswer: "A",
    explanation: "log₁₀(1000) = 3, ker 10^3 = 1000."
  },
  {
    question: "Kaj je osnova naravnega logaritma?",
    options: ["e", "10", "2", "1"],
    correctAnswer: "A",
    explanation: "Naravni logaritem ima osnovo e."
  },
  {
    question: "Koliko je log₂(8)?",
    options: ["3", "2", "1", "4"],
    correctAnswer: "A",
    explanation: "2^3 = 8."
  },
  {
    question: "Kaj je loga(a)?",
    options: ["1", "0", "a", "nedoločen"],
    correctAnswer: "A",
    explanation: "logₐ(a) = 1."
  },
  {
    question: "Kaj je loga(1)?",
    options: ["0", "1", "a", "nedoločen"],
    correctAnswer: "A",
    explanation: "logₐ(1) = 0, ker a^0 = 1."
  },
  {
    question: "Koliko je log₁₀(0.1)?",
    options: ["-1", "1", "0", "-10"],
    correctAnswer: "A",
    explanation: "log₁₀(0.1) = -1, ker 10^-1 = 0.1."
  },
  {
    question: "Kaj je ln(e)?",
    options: ["1", "e", "0", "nedoločen"],
    correctAnswer: "A",
    explanation: "ln(e) = 1 po definiciji."
  },
  {
    question: "Koliko je log₂(1)?",
    options: ["0", "1", "2", "nedoločen"],
    correctAnswer: "A",
    explanation: "2^0 = 1."
  },
  {
    question: "Kaj je logaritmična funkcija?",
    options: ["Inverzna eksponentni", "Kvadratna", "Trigonometrična", "Linearna"],
    correctAnswer: "A",
    explanation: "Logaritemska funkcija je obratna eksponentni."
  },
  {
    question: "Katera funkcija je obratna funkcija ln(x)?",
    options: ["e^x", "log₁₀(x)", "x²", "1/x"],
    correctAnswer: "A",
    explanation: "Obratna funkcija ln(x) je e^x."
  },
  {
    question: "Kaj je loga(bc)?",
    options: ["logₐ(b) + logₐ(c)", "logₐ(bc)", "logₐ(b) * logₐ(c)", "logₐ(b - c)"],
    correctAnswer: "A",
    explanation: "Uporabimo pravilo logaritmov za produkt."
  },
  {
    question: "Kaj je loga(b/c)?",
    options: ["logₐ(b) - logₐ(c)", "logₐ(bc)", "logₐ(c) - logₐ(b)", "logₐ(b + c)"],
    correctAnswer: "A",
    explanation: "Uporabimo pravilo logaritmov za količnik."
  },
  {
    question: "Kaj je loga(b^c)?",
    options: ["c * logₐ(b)", "logₐ(b) + c", "loga(c^b)", "loga(c)/loga(b)"],
    correctAnswer: "A",
    explanation: "Uporabimo pravilo logaritmov za potenco."
  },
  {
    question: "Koliko je ln(1/e)?",
    options: ["-1", "1", "0", "e"],
    correctAnswer: "A",
    explanation: "ln(1/e) = ln(e^-1) = -1."
  },
  {
    question: "Kaj je osnovna oblika eksponentne funkcije?",
    options: ["a^x", "x^a", "logₐ(x)", "ln(x)"],
    correctAnswer: "A",
    explanation: "Eksponentna funkcija je a^x."
  }
]},
  'Programiranje': {
   'Spremenljivke': [
  {
    question: "Katera izmed naslednjih ni veljavna deklaracija spremenljivke v Pythonu?",
    options: ["x = 5", "_y = 'test'", "3z = 7.5", "ime_spremenljivke = True"],
    correctAnswer: "C",
    explanation: "Ime spremenljivke ne more začeti s številko."
  },
  {
    question: "Kateri tip podatka uporabimo za shranjevanje decimalnih števil v Pythonu?",
    options: ["int", "float", "decimal", "number"],
    correctAnswer: "B",
    explanation: "float je standardni tip za decimalna števila."
  },
  {
    question: "Kaj bo rezultat ukaza: `x = '5'; type(x)`?",
    options: ["int", "float", "str", "bool"],
    correctAnswer: "C",
    explanation: "Ker je 5 v narekovajih, gre za niz (string)."
  },
  {
    question: "Kako spremenimo vrednost spremenljivke v Pythonu?",
    options: ["z uporabo operatorja =", "z uporabo funkcije change()", "ni mogoče", "z uporabo ključne besede var"],
    correctAnswer: "A",
    explanation: "Operator `=` se uporablja za dodelitev nove vrednosti spremenljivki."
  },
  {
    question: "Kaj pomeni izraz `x += 2`?",
    options: ["x = x + 2", "x = x * 2", "x = 2", "Napaka"],
    correctAnswer: "A",
    explanation: "`+=` pomeni povečanje trenutne vrednosti spremenljivke za določeno število."
  },
  {
    question: "Katerega tipa bo spremenljivka `x = 5.0`?",
    options: ["int", "float", "str", "complex"],
    correctAnswer: "B",
    explanation: "`5.0` je decimalno število, torej tipa `float`."
  },
  {
    question: "Ali je `True` veljavna vrednost v Pythonu?",
    options: ["Da", "Ne", "Samo v funkciji", "Samo v pogojih"],
    correctAnswer: "A",
    explanation: "`True` je logična vrednost v Pythonu, enaka tipu `bool`."
  },
  {
    question: "Kaj pomeni `None` v Pythonu?",
    options: ["Napaka", "Nedefinirana spremenljivka", "Posebna vrednost, ki pomeni 'nič'", "Prazna vrstica"],
    correctAnswer: "C",
    explanation: "`None` pomeni, da spremenljivka trenutno nima vrednosti."
  },
  {
    question: "Katera izjava ustvari celoštevilsko spremenljivko?",
    options: ["x = 10", "x = '10'", "x = 10.0", "x = True"],
    correctAnswer: "A",
    explanation: "`x = 10` ustvari spremenljivko tipa `int`."
  },
  {
    question: "Katero ime spremenljivke je NEveljavno?",
    options: ["_stevilo", "ime1", "mojaSpremenljivka", "def"],
    correctAnswer: "D",
    explanation: "`def` je rezervirana beseda v Pythonu in se ne sme uporabljati kot ime spremenljivke."
  },
  {
    question: "Kako preverimo tip spremenljivke?",
    options: ["typeof(x)", "x.type()", "type(x)", "x.typeof"],
    correctAnswer: "C",
    explanation: "Funkcija `type(x)` vrne tip podatka."
  },
  {
    question: "Kaj se zgodi, če spremenljivki `x` priredimo `x = '20'` in nato `x = int(x)`?",
    options: ["Napaka", "x ostane niz", "x postane število", "x se izbriše"],
    correctAnswer: "C",
    explanation: "Funkcija `int()` pretvori niz `'20'` v celo število."
  },
  {
    question: "Ali lahko ena spremenljivka vsebuje seznam?",
    options: ["Ne", "Da", "Samo če vsebuje številke", "Samo v funkciji"],
    correctAnswer: "B",
    explanation: "Spremenljivke lahko vsebujejo sezname, nize, številke itd."
  },
  {
    question: "Katera izjava ustvari seznam z dvema elementoma?",
    options: ["x = [1, 2]", "x = '1,2'", "x = (1,2)", "x = {1,2}"],
    correctAnswer: "A",
    explanation: "`[1, 2]` je seznam (list)."
  },
  {
    question: "Kakšna bo vrednost `x` po tem ukazu: `x = 5; x = x * 2`?",
    options: ["5", "2", "10", "Napaka"],
    correctAnswer: "C",
    explanation: "`x * 2` pomeni 5 * 2, torej 10."
  },
  {
    question: "Kaj pomeni izraz `x = 'abc' + '123'`?",
    options: ["Napaka", "abc123", "abc 123", "abc+123"],
    correctAnswer: "B",
    explanation: "Operator `+` združuje niza v `abc123`."
  },
  {
    question: "Ali je Python občutljiv na velike/male črke v imenih spremenljivk?",
    options: ["Ne", "Da", "Samo v funkcijah", "Samo za števila"],
    correctAnswer: "B",
    explanation: "Python razlikuje med `ime` in `Ime` – gre za dve različni spremenljivki."
  },
  {
    question: "Kaj bo rezultat ukaza `x = bool(0)`?",
    options: ["True", "False", "0", "Napaka"],
    correctAnswer: "B",
    explanation: "`bool(0)` vrne `False`, saj je 0 vrednost, ki predstavlja laž v Pythonu."
  },
  {
    question: "Kaj bo rezultat: `x = '5'; y = 2; z = x * y`?",
    options: ["10", "55", "'55'", "'55555'"],
    correctAnswer: "D",
    explanation: "Niz `'5'` pomnožen z 2 pomeni, da se niz ponovi dvakrat – `55555`."
  },
  {
    question: "Kaj pomeni `x = None`?",
    options: ["x nima vrednosti", "x je 0", "x je niz", "Napaka"],
    correctAnswer: "A",
    explanation: "`None` pomeni, da spremenljivka nima določene vrednosti."
  }
],
    'Funkcije': [
  {
    question: "Kaj izpiše koda 'def f(x): return x*2; print(f(3))'?",
    options: ["3", "6", "9", "Napako"],
    correctAnswer: "B",
    explanation: "Funkcija podvoji vhodno vrednost."
  },
  {
    question: "Kaj naredi ključna beseda 'return' v funkciji?",
    options: [
      "Konča izvajanje funkcije",
      "Vrne vrednost in konča funkcijo",
      "Naredi zanko",
      "Prekine program"
    ],
    correctAnswer: "B",
    explanation: "return vrne vrednost in zaključi izvajanje funkcije."
  },
  {
    question: "Kaj se zgodi, če funkcija nima 'return' stavka?",
    options: ["Vrne 0", "Vrne None", "Vrne napako", "Vrne prazen niz"],
    correctAnswer: "B",
    explanation: "Privzeto se vrne `None`, če ni `return` stavka."
  },
  {
    question: "Kako podamo več vhodnih vrednosti funkciji?",
    options: ["Z uporabo vejic", "Z uporabo seznama", "S funkcijo input()", "Ni mogoče"],
    correctAnswer: "A",
    explanation: "Argumente ločimo z vejicami, npr. `def f(x, y)`."
  },
  {
    question: "Kaj pomeni 'def' v Pythonu?",
    options: ["Določi spremenljivko", "Določi funkcijo", "Definira zanko", "Prekine izvajanje"],
    correctAnswer: "B",
    explanation: "`def` se uporablja za definiranje funkcij."
  },
  {
    question: "Kaj pomeni 'f(2, 3)' če je `def f(a, b): return a + b`?",
    options: ["5", "6", "8", "Napaka"],
    correctAnswer: "A",
    explanation: "2 + 3 = 5."
  },
  {
    question: "Katera funkcija izpiše vrednost na zaslon?",
    options: ["input()", "print()", "return", "show()"],
    correctAnswer: "B",
    explanation: "`print()` izpiše podatke v terminal."
  },
  {
    question: "Kaj pomeni *args v funkciji?",
    options: ["Poljubno število argumentov", "Seznam", "Niz", "Napaka"],
    correctAnswer: "A",
    explanation: "`*args` omogoča, da funkcija sprejme poljubno število argumentov."
  },
  {
    question: "Ali lahko funkcija vrne več vrednosti?",
    options: ["Ne", "Da", "Samo z globalno spremenljivko", "Samo z razredi"],
    correctAnswer: "B",
    explanation: "Funkcija lahko vrne tuple z več vrednostmi."
  },
  {
    question: "Kakšen je rezultat `len('program')`?",
    options: ["6", "7", "8", "Napaka"],
    correctAnswer: "B",
    explanation: "`program` ima 7 znakov."
  },
  {
    question: "Kaj je privzeta vrednost parametra v funkciji?",
    options: ["Obvezna", "Ni dovoljena", "Vnaprej določena vrednost", "Konstanta"],
    correctAnswer: "C",
    explanation: "Privzete vrednosti se uporabijo, če argument ni podan."
  },
  {
    question: "Katera vrstica pravilno kliče funkcijo brez parametrov?",
    options: ["f[]", "f()", "f{}", "call f"],
    correctAnswer: "B",
    explanation: "Funkcija se kliče z `()`."
  },
  {
    question: "Kaj pomeni 'lambda' funkcija?",
    options: ["Zanka", "Anonimna funkcija", "Pogoj", "Dekorator"],
    correctAnswer: "B",
    explanation: "`lambda` ustvarja majhne anonimne funkcije."
  },
  {
    question: "Ali lahko funkcija kličete drugo funkcijo?",
    options: ["Ne", "Da", "Samo enkrat", "Samo z globalno spremenljivko"],
    correctAnswer: "B",
    explanation: "Funkcije lahko kličejo druge funkcije (tudi rekurzivno)."
  },
  {
    question: "Kako se imenuje funkcija, ki kliče samo sebe?",
    options: ["Zanka", "Rekurzija", "Dekorator", "Iterator"],
    correctAnswer: "B",
    explanation: "Funkcija, ki kliče samo sebe, je rekurzivna."
  },
  {
    question: "Kaj pomeni `global x` v funkciji?",
    options: ["Ustvari lokalno spremenljivko", "Uporablja globalno spremenljivko", "Izbriše x", "Nič"],
    correctAnswer: "B",
    explanation: "`global` omogoči dostop do globalne spremenljivke."
  },
  {
    question: "Ali funkcija lahko sprejme seznam kot parameter?",
    options: ["Da", "Ne", "Samo z `import`", "Samo niz"],
    correctAnswer: "A",
    explanation: "Funkcija lahko prejme seznam kot argument."
  },
  {
    question: "Kaj je rezultat: `def f(x): return x**2; print(f(4))`?",
    options: ["8", "16", "4", "Napaka"],
    correctAnswer: "B",
    explanation: "`x**2` je potenciranje, torej 4^2 = 16."
  },
  {
    question: "Ali lahko funkcija vrne funkcijo?",
    options: ["Ne", "Da", "Samo v razredih", "Samo z `lambda`"],
    correctAnswer: "B",
    explanation: "V Pythonu lahko funkcija vrne drugo funkcijo."
  },
  {
    question: "Kdaj se uporabi ključna beseda 'pass' v funkciji?",
    options: ["Za izpis", "Za prekinitev", "Kot nadomestek za prazno telo", "Za vrnitev"],
    correctAnswer: "C",
    explanation: "`pass` se uporabi, kadar funkcija še ni implementirana."
  }
]
,
    'Zanke': [
  {
    question: "Kolikokrat se izvede zanka 'for i in range(5):'?",
    options: ["4", "5", "6", "7"],
    correctAnswer: "B",
    explanation: "range(5) generira številke od 0 do 4 (5 ponovitev)."
  },
  {
    question: "Katera zanka se vedno izvede vsaj enkrat?",
    options: ["for", "while", "do-while", "foreach"],
    correctAnswer: "C",
    explanation: "do-while preveri pogoj šele po izvedbi."
  },
  {
    question: "Kaj pomeni `break` v zanki?",
    options: ["Preskoči iteracijo", "Konča zanko", "Začne novo zanko", "Preveri pogoj"],
    correctAnswer: "B",
    explanation: "`break` konča izvajanje zanke."
  },
  {
    question: "Kaj pomeni `continue` v zanki?",
    options: ["Prekine program", "Preskoči preostanek iteracije", "Konča program", "Nič"],
    correctAnswer: "B",
    explanation: "`continue` preskoči preostanek trenutne iteracije."
  },
  {
    question: "Kako bi ustvarili zanko, ki se izvede 10-krat?",
    options: ["for i in range(10):", "while i < 10:", "do while i < 10:", "loop(10)"],
    correctAnswer: "A",
    explanation: "`range(10)` izvede 10 ponovitev (od 0 do 9)."
  },
  {
    question: "Kaj je rezultat: `for i in range(3): print(i)`?",
    options: ["1 2 3", "0 1 2", "0 1 2 3", "Napaka"],
    correctAnswer: "B",
    explanation: "`range(3)` izpiše 0, 1, 2."
  },
  {
    question: "Katera izmed naslednjih zank je neskončna?",
    options: ["while True:", "for i in range(1,10):", "while i < 5:", "for x in seznam:"],
    correctAnswer: "A",
    explanation: "`while True:` se izvaja neskončno (razen če jo prekinemo)."
  },
  {
    question: "Ali lahko zanke vsebujejo zanke?",
    options: ["Ne", "Da", "Samo `for` zanke", "Samo v funkcijah"],
    correctAnswer: "B",
    explanation: "Zanke lahko gnezdimo (npr. zanka v zanki)."
  },
  {
    question: "Kaj se zgodi, če `range()` dobi negativno število?",
    options: ["Napaka", "Ne izvede se nič", "Šteje v obratno", "Podvoji zanko"],
    correctAnswer: "B",
    explanation: "`range(-5)` ne ustvari nobenega števila, zanka se ne izvede."
  },
  {
    question: "Kaj izpiše koda: `i = 0; while i < 3: print(i); i += 1`?",
    options: ["1 2 3", "0 1 2", "0 1 2 3", "Napaka"],
    correctAnswer: "B",
    explanation: "Zanka se izvede 3-krat: 0, 1, 2."
  },
  {
    question: "Kaj pomeni `for char in 'abc':`?",
    options: ["Zanka po številih", "Zanka po znakih", "Napaka", "Zanka po seznamu"],
    correctAnswer: "B",
    explanation: "Zanka gre po vsakem znaku v nizu 'abc'."
  },
  {
    question: "Katera zanka se lahko uporablja z `range()`?",
    options: ["while", "for", "do-while", "foreach"],
    correctAnswer: "B",
    explanation: "`range()` se pogosto uporablja z `for` zanko."
  },
  {
    question: "Katera zanka se ne konča brez dodatnega pogoja?",
    options: ["while True:", "for i in range(10):", "for x in seznam:", "while x < 10:"],
    correctAnswer: "A",
    explanation: "Neskončna zanka, če ni `break` pogoja."
  },
  {
    question: "Kaj izpiše: `for i in range(2, 5): print(i)`?",
    options: ["2 3 4", "2 3 4 5", "1 2 3", "Napaka"],
    correctAnswer: "A",
    explanation: "range(2,5) generira 2, 3, 4."
  },
  {
    question: "Ali `while` zanka potrebuje pogoj?",
    options: ["Da", "Ne", "Samo v funkciji", "Samo s `break`"],
    correctAnswer: "A",
    explanation: "`while` zanka vedno potrebuje pogoj."
  },
  {
    question: "Kaj se zgodi z `for i in range(1, 10, 2)`?",
    options: ["Napaka", "Izvede se vsak 2. korak", "Pride do 10", "Ne izvede se"],
    correctAnswer: "B",
    explanation: "Korak 2 pomeni: 1, 3, 5, 7, 9."
  },
  {
    question: "Kaj izpiše: `for i in []: print('x')`?",
    options: ["x", "xxx", "nič", "Napaka"],
    correctAnswer: "C",
    explanation: "Ker je seznam prazen, se zanka ne izvede."
  },
  {
    question: "Kaj pomeni izraz `enumerate(seznam)`?",
    options: ["Ustvari indeksirano zanko", "Sortira seznam", "Podvoji seznam", "Doda številke"],
    correctAnswer: "A",
    explanation: "`enumerate()` vrne indeks in element v zanki."
  },
  {
    question: "Katera izmed naslednjih NI vrsta zanke v Pythonu?",
    options: ["for", "while", "do-while", "repeat-until"],
    correctAnswer: "D",
    explanation: "`repeat-until` ne obstaja v Pythonu."
  }
],
   'OOP': [
  {
    "question": "Kaj je glavna značilnost objektno orientiranega programiranja?",
    "options": ["Uporaba funkcij", "Uporaba objektov", "Hitrost izvajanja", "Brezuporabnost"],
    "correctAnswer": "B",
    "explanation": "OOP temelji na objektih in njihovi interakciji."
  },
  {
    "question": "Kaj je razred v OOP?",
    "options": ["Primerek objekta", "Predloga za ustvarjanje objektov", "Funkcija znotraj objekta", "Spremenljivka v objektu"],
    "correctAnswer": "B",
    "explanation": "Razred je predloga (blueprint) za objekte."
  },
  {
    "question": "Kako imenujemo objekt, ustvarjen iz razreda?",
    "options": ["Funkcija", "Instanca", "Metoda", "Paket"],
    "correctAnswer": "B",
    "explanation": "Objekt, ustvarjen iz razreda, je instanca."
  },
  {
    "question": "Kaj je dedovanje (inheritance) v OOP?",
    "options": ["Ustvarjanje nove funkcije", "Zmožnost enega razreda, da prevzame lastnosti drugega", "Uporaba zanke", "Klicanje metode"],
    "correctAnswer": "B",
    "explanation": "Dedovanje omogoča, da razred prevzame lastnosti in metode drugega razreda."
  },
  {
    "question": "Kaj pomeni enkapsulacija?",
    "options": ["Uporaba zank", "Skritje podatkov in metode znotraj razreda", "Uporaba spremenljivk", "Pisanje komentarjev"],
    "correctAnswer": "B",
    "explanation": "Enkapsulacija pomeni skrivanje notranjega delovanja objekta pred zunanjim svetom."
  },
  {
    "question": "Kaj je polimorfizem?",
    "options": ["Zmožnost enega objekta, da se obnaša na več načinov", "Uporaba več objektov", "Pisanje komentarjev", "Uporaba statičnih spremenljivk"],
    "correctAnswer": "A",
    "explanation": "Polimorfizem omogoča uporabo enakega imena metode z različnim delovanjem."
  },
  {
    "question": "Kaj pomeni 'self' v Python razredu?",
    "options": ["Globalna spremenljivka", "Sklic na trenutni objekt", "Metoda", "Modul"],
    "correctAnswer": "B",
    "explanation": "'self' se uporablja za dostop do atributov trenutne instance razreda."
  },
  {
    "question": "Katera ključna beseda se uporablja za ustvarjanje razreda?",
    "options": ["function", "def", "class", "object"],
    "correctAnswer": "C",
    "explanation": "'class' se uporablja za definiranje razreda."
  },
  {
    "question": "Kaj je metoda v OOP?",
    "options": ["Funkcija znotraj razreda", "Zanka", "Spremenljivka", "Modul"],
    "correctAnswer": "A",
    "explanation": "Metoda je funkcija, definirana znotraj razreda."
  },
  {
    "question": "Kaj pomeni konstruktor v razredu?",
    "options": ["Metoda za brisanje objekta", "Metoda za inicializacijo objekta", "Zanka", "Dedič razreda"],
    "correctAnswer": "B",
    "explanation": "Konstruktor inicializira objekt, ko je ustvarjen."
  },
  {
    "question": "Katera metoda predstavlja konstruktor v Pythonu?",
    "options": ["__start__", "__new__", "__init__", "__construct__"],
    "correctAnswer": "C",
    "explanation": "__init__ je konstruktor v Pythonu."
  },
  {
    "question": "Kaj pomeni zasebni atribut (npr. __ime)?",
    "options": ["Lahko se dostopa od kjerkoli", "Dostop je omejen znotraj razreda", "Je globalna spremenljivka", "Je konstanta"],
    "correctAnswer": "B",
    "explanation": "Zasebni atributi so dostopni le znotraj razreda."
  },
  {
    "question": "Ali je možno podedovati več razredov v Pythonu?",
    "options": ["Ne", "Da", "Le če je razred statičen", "Le s posebnimi knjižnicami"],
    "correctAnswer": "B",
    "explanation": "Python omogoča večkratno dedovanje."
  },
  {
    "question": "Kaj omogoča OOP bolj kot proceduralno programiranje?",
    "options": ["Hitrejše izvajanje", "Boljšo organizacijo kode", "Več komentarjev", "Uporabo globalnih spremenljivk"],
    "correctAnswer": "B",
    "explanation": "OOP omogoča boljšo modularnost in organizacijo kode."
  },
  {
    "question": "Kateri koncept omogoča nadpisovanje (overriding) metode iz starševskega razreda?",
    "options": ["Dedovanje", "Polimorfizem", "Enkapsulacija", "Statika"],
    "correctAnswer": "B",
    "explanation": "Polimorfizem omogoča nadpisovanje metod."
  },
  {
    "question": "Ali se lahko razredi uporabljajo kot podatkovni tipi?",
    "options": ["Ne", "Da", "Samo v Javi", "Samo pri API-jih"],
    "correctAnswer": "B",
    "explanation": "Razredi se lahko uporabljajo kot tipi objektov."
  },
  {
    "question": "Kaj je lastnost (attribute) v OOP?",
    "options": ["Funkcija", "Podatek, ki pripada objektu", "Modul", "Zanka"],
    "correctAnswer": "B",
    "explanation": "Lastnosti so podatki, vezani na objekt."
  },
  {
    "question": "Katera praksa omogoča ponovno uporabo kode v OOP?",
    "options": ["Komentiranje", "Dedovanje", "Zankanje", "Importanje"],
    "correctAnswer": "B",
    "explanation": "Dedovanje omogoča ponovno uporabo kode."
  },
  {
    "question": "Kako se imenuje razred, ki deduje lastnosti drugega razreda?",
    "options": ["Podrazred", "Superrazred", "Modul", "Objekt"],
    "correctAnswer": "A",
    "explanation": "Podrazred deduje lastnosti nadrazreda."
  },
  {
    "question": "Kako imenujemo razred, ki je osnova za druge razrede?",
    "options": ["Zgornji razred", "Nadrazred", "Razširjeni razred", "Temeljni objekt"],
    "correctAnswer": "B",
    "explanation": "Nadrazred je razred, iz katerega drugi dedujejo."
  }
],
   'API-ji': [
  {
    "question": "Kaj pomeni kratica API?",
    "options": ["Application Programming Interface", "Automated Program Interaction", "Advanced Programming Instruction", "Application Process Integration"],
    "correctAnswer": "A",
    "explanation": "API omogoča komunikacijo med različnimi programi."
  },
  {
    "question": "Katera HTTP metoda se uporablja za pridobivanje podatkov iz API-ja?",
    "options": ["GET", "POST", "PUT", "DELETE"],
    "correctAnswer": "A",
    "explanation": "GET zahteva se uporabljajo za pridobivanje podatkov."
  },
  {
    "question": "Katera metoda se uporablja za ustvarjanje novih virov v API-ju?",
    "options": ["GET", "POST", "PUT", "DELETE"],
    "correctAnswer": "B",
    "explanation": "POST se uporablja za ustvarjanje novih virov."
  },
  {
    "question": "Kaj pomeni REST?",
    "options": ["Representational State Transfer", "Remote Server Transaction", "Rapid Execution System Test", "Read External Server Text"],
    "correctAnswer": "A",
    "explanation": "REST je arhitekturni slog za spletne storitve."
  },
  {
    "question": "Kaj vrača HTTP status 200?",
    "options": ["Napaka", "Ni najdeno", "Uspeh", "Preusmeritev"],
    "correctAnswer": "C",
    "explanation": "200 pomeni uspešno obdelavo zahteve."
  },
  {
    "question": "Kaj pomeni statusna koda 404?",
    "options": ["Najdeno", "Napaka strežnika", "Ni najdeno", "Zahteva preusmerjena"],
    "correctAnswer": "C",
    "explanation": "404 pomeni, da vir ni bil najden."
  },
  {
    "question": "Kaj vsebuje telo (body) POST zahteve?",
    "options": ["Podatke za posodobitev", "Podatke za ustvarjanje", "Glave (headers)", "Statusno kodo"],
    "correctAnswer": "B",
    "explanation": "POST telo običajno vsebuje podatke za ustvarjanje novega vira."
  },
  {
    "question": "Kaj je endpoint?",
    "options": ["Naslov API-ja", "Metoda v Pythonu", "URL za dostop do določene funkcije API-ja", "Zanka"],
    "correctAnswer": "C",
    "explanation": "Endpoint je URL naslov za določeno funkcionalnost v API-ju."
  },
  {
    "question": "Kaj pomeni JSON?",
    "options": ["JavaScript Object Notation", "Java System Online", "Just Syntax Output Notation", "Joint System of Numbers"],
    "correctAnswer": "A",
    "explanation": "JSON je format za prenos podatkov med odjemalcem in strežnikom."
  },
  {
    "question": "Kaj označuje statusna koda 500?",
    "options": ["Uspeh", "Zahteva ni najdena", "Napaka na strani strežnika", "Neavtoriziran dostop"],
    "correctAnswer": "C",
    "explanation": "500 pomeni notranja napaka strežnika."
  },
  {
    "question": "Kaj je API ključ (API key)?",
    "options": ["Geslo za vstop v API", "Identifikator za dostop do API-ja", "Naslov strežnika", "Zanka v programu"],
    "correctAnswer": "B",
    "explanation": "API ključ identificira uporabnika, ki uporablja API."
  },
  {
    "question": "Katera metoda se uporablja za brisanje virov?",
    "options": ["GET", "POST", "PUT", "DELETE"],
    "correctAnswer": "D",
    "explanation": "DELETE se uporablja za brisanje virov v API-ju."
  },
  {
    "question": "Kaj pomeni statusna koda 403?",
    "options": ["Ni dovoljeno", "Zahteva uspešna", "Strežnik ni na voljo", "Preusmeritev"],
    "correctAnswer": "A",
    "explanation": "403 pomeni prepovedan dostop (forbidden)."
  },
  {
    "question": "Ali lahko API-ji vrnejo napake?",
    "options": ["Ne", "Da", "Samo pri GET", "Samo v testnem načinu"],
    "correctAnswer": "B",
    "explanation": "API-ji lahko vrnejo različne statusne kode za napake."
  },
  {
    "question": "Kaj je dokumentacija API-ja?",
    "options": ["Navodila za uporabo API-ja", "Koda API-ja", "Seznam uporabnikov", "Nadzorna plošča"],
    "correctAnswer": "A",
    "explanation": "Dokumentacija opisuje, kako uporabljati API."
  },
  {
    "question": "Kaj pomeni avtorizacija pri API-jih?",
    "options": ["Dostop do virov z dovoljenjem", "Pisanje kode", "Preizkus API-ja", "Klicanje metode"],
    "correctAnswer": "A",
    "explanation": "Avtorizacija zagotavlja, da ima uporabnik dovoljenje za določeno dejanje."
  },
  {
    "question": "Kaj označuje status 201?",
    "options": ["Napaka", "Ustvarjen nov vir", "Zahteva preusmerjena", "Ni dovoljeno"],
    "correctAnswer": "B",
    "explanation": "201 pomeni, da je bil nov vir uspešno ustvarjen."
  },
  {
    "question": "Kaj pomeni CORS?",
    "options": ["Cross-Origin Resource Sharing", "Custom Object Request Server", "Code Output Response Syntax", "Client-Origin Routing System"],
    "correctAnswer": "A",
    "explanation": "CORS omogoča deljenje virov med različnimi domenami."
  },
  {
    "question": "Ali je REST API vedno enak kot GraphQL?",
    "options": ["Da", "Ne", "Odvisno od jezika", "Samo pri JSON formatu"],
    "correctAnswer": "B",
    "explanation": "REST in GraphQL sta različna pristopa k API-jem."
  },
  {
    "question": "Kaj je namen API testa?",
    "options": ["Preverjanje funkcionalnosti API-ja", "Pisanje kode", "Risanje diagrama", "Pošiljanje e-pošte"],
    "correctAnswer": "A",
    "explanation": "Testiranje API-jev preverja pravilno delovanje različnih funkcij."
  }
]},
  'Informacijski sistemi': {
   'ER modeli': [
  {
    question: "Kaj predstavlja pravokotnik v ER diagramu?",
    options: ["Entiteto", "Atribut", "Razmerje", "Tabelo"],
    correctAnswer: "A",
    explanation: "Entitete so predstavljene s pravokotniki."
  },
  {
    question: "Kaj predstavlja romb v ER diagramu?",
    options: ["Entiteto", "Atribut", "Razmerje", "Tabelo"],
    correctAnswer: "C",
    explanation: "Razmerja med entitetami so predstavljena z rombi."
  },
  {
    question: "Kaj predstavlja elipsa v ER diagramu?",
    options: ["Entiteto", "Razmerje", "Atribut", "Tuji ključ"],
    correctAnswer: "C",
    explanation: "Elipse predstavljajo atribute entitet."
  },
  {
    question: "Kaj pomeni večvrednostni atribut?",
    options: [
      "Atribut z več tipi podatkov",
      "Atribut, ki lahko vsebuje več vrednosti za eno entiteto",
      "Atribut, ki se ne uporablja",
      "Tuji atribut"
    ],
    correctAnswer: "B",
    explanation: "Večvrednostni atribut lahko ima več vrednosti za en zapis."
  },
  {
    question: "Katera trditev o primarnem ključu je pravilna?",
    options: [
      "Lahko vsebuje ponovljive vrednosti",
      "Vedno je sestavljen iz dveh atributov",
      "Enolično identificira entiteto",
      "Je vedno tipa integer"
    ],
    correctAnswer: "C",
    explanation: "Primarni ključ mora enolično identificirati entiteto."
  },
  {
    question: "Kateri simbol se uporablja za povezovanje atributov z entiteto?",
    options: ["Premica", "Romb", "Krog", "Puščica"],
    correctAnswer: "A",
    explanation: "Atributi so s premico povezani z entitetami."
  },
  {
    question: "Kaj pomeni kardinalnost 1:N med entitetama?",
    options: [
      "Ena entiteta se povezuje z največ eno drugo",
      "Ena entiteta se povezuje z več entitetami",
      "Vsaka entiteta se povezuje z vsako drugo",
      "Ni povezave"
    ],
    correctAnswer: "B",
    explanation: "1:N pomeni, da se ena entiteta lahko povezuje z več drugimi."
  },
  {
    question: "Kaj je sestavljen atribut?",
    options: [
      "Atribut, ki je del več entitet",
      "Atribut z več podatkovnimi tipi",
      "Atribut, sestavljen iz več podatributov",
      "Atribut, ki povezuje razmerja"
    ],
    correctAnswer: "C",
    explanation: "Sestavljeni atributi vsebujejo več podatributov (npr. ime in priimek)."
  },
  {
    question: "Kaj je slabost večvrednostnih atributov?",
    options: [
      "Zmanjšujejo zmogljivost baze",
      "Povečujejo redundanco",
      "Zmanjšujejo berljivost modela",
      "V ER diagramu so prepovedani"
    ],
    correctAnswer: "B",
    explanation: "Večvrednostni atributi lahko povzročajo redundanco podatkov."
  },
  {
    question: "Kaj pomeni 'weak entity' (šibka entiteta)?",
    options: [
      "Entiteta brez atributov",
      "Entiteta brez primarnega ključa",
      "Entiteta, ki obstaja le v povezavi z drugo entiteto",
      "Entiteta z več relacijami"
    ],
    correctAnswer: "C",
    explanation: "Šibka entiteta potrebuje povezavo z močno entiteto za obstoj."
  },
  {
    question: "Kateri simbol označuje večvrednostni atribut v ER diagramu?",
    options: ["Podvojena elipsa", "Pravokotnik", "Romb", "Podčrtana elipsa"],
    correctAnswer: "A",
    explanation: "Večvrednostni atributi so prikazani kot podvojene elipse."
  },
  {
    question: "Kaj je generalizacija v ER modeliranju?",
    options: [
      "Združevanje podobnih entitet v splošnejšo entiteto",
      "Razdelitev entitete na manjše",
      "Ustvarjanje relacij med atributi",
      "Dodajanje novih atributov entiteti"
    ],
    correctAnswer: "A",
    explanation: "Generalizacija združi entitete z enakimi lastnostmi."
  },
  {
    question: "Kaj je specializacija v ER modeliranju?",
    options: [
      "Dodajanje atributov entitetam",
      "Razdelitev entitete v specifične podentitete",
      "Združevanje entitet",
      "Sprememba tipa atributa"
    ],
    correctAnswer: "B",
    explanation: "Specializacija pomeni razdelitev entitete v bolj specifične podskupine."
  },
  {
    question: "Kakšen je namen ER modela?",
    options: [
      "Modeliranje podatkovnih tokov",
      "Predstavitev fizične strukture baze",
      "Logično modeliranje entitet in njihovih povezav",
      "Spletno programiranje"
    ],
    correctAnswer: "C",
    explanation: "ER modeli služijo logičnemu modeliranju podatkovnih struktur."
  },
  {
    question: "Kaj pomeni 'total participation' (popolna udeležba)?",
    options: [
      "Vse entitete so povezane v vsaj eno relacijo",
      "Vse relacije imajo primarni ključ",
      "Vsak atribut ima vrednost",
      "Vsi atributi sodelujejo v razmerjih"
    ],
    correctAnswer: "A",
    explanation: "Popolna udeležba pomeni, da mora vsaka entiteta sodelovati v relaciji."
  },
  {
    question: "Katera izmed naslednjih je primer šibke entitete?",
    options: [
      "Naročilo brez identifikatorja, odvisno od stranke",
      "Tabela izdelkov z ID-jem",
      "Entiteta z več atributi",
      "Tuji ključ"
    ],
    correctAnswer: "A",
    explanation: "Šibke entitete nimajo lastnega ključa in so odvisne od druge entitete."
  },
  {
    question: "Kaj predstavlja podčrtan atribut v ER diagramu?",
    options: ["Primarni ključ", "Zunanji ključ", "Sestavljeni atribut", "Večvrednostni atribut"],
    correctAnswer: "A",
    explanation: "Podčrtan atribut v ER diagramu predstavlja primarni ključ."
  },
  {
    question: "Katera trditev o razmerjih je pravilna?",
    options: [
      "Razmerje povezuje entitete",
      "Razmerje je vedno med atributi",
      "Razmerja nimajo imen",
      "Razmerja so prikazana kot kvadrati"
    ],
    correctAnswer: "A",
    explanation: "Razmerja v ER diagramu povezujejo entitete."
  },
  {
    question: "Kakšna je razlika med šibko in močno entiteto?",
    options: [
      "Močna entiteta je vedno tuji ključ",
      "Šibka entiteta nima dovolj atributov",
      "Šibka entiteta nima lastnega ključa in je odvisna od druge",
      "Močna entiteta ne sme biti povezana z drugimi"
    ],
    correctAnswer: "C",
    explanation: "Šibke entitete nimajo svojega primarnega ključa in so vezane na drugo entiteto."
  },
  {
    question: "Kaj pomeni kardinalnost 1:1?",
    options: [
      "Vsaka entiteta se povezuje z največ eno drugo entiteto",
      "Ena entiteta se lahko poveže z več entitetami",
      "Ni mogoče določiti",
      "Pomeni večvrednostni atribut"
    ],
    correctAnswer: "A",
    explanation: "1:1 pomeni, da se ena entiteta povezuje z največ eno drugo entiteto."
  }
]
,
  'Normalizacija': [
  {
    question: "Kaj je glavni cilj normalizacije podatkov?",
    options: [
      "Pospešitev poizvedb",
      "Zmanjšanje podatkovne redundance",
      "Povečanje varnosti",
      "Uporaba več prostora"
    ],
    correctAnswer: "B",
    explanation: "Normalizacija zmanjšuje podvajanje podatkov."
  },
  {
    question: "Katera normalna forma prepoveduje večvrednostne atribute?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctAnswer: "A",
    explanation: "1NF zahteva atomske (nedeljive) vrednosti."
  },
  {
    question: "Kaj pomeni druga normalna forma (2NF)?",
    options: [
      "Vse atribute so odvisni od celotnega primarnega ključa",
      "Vse atribute so odvisni od dela ključa",
      "Ni podvajanja tabel",
      "Tabela ima samo en atribut"
    ],
    correctAnswer: "A",
    explanation: "2NF zahteva, da so vsi atributi funkcionalno odvisni od celotnega primarnega ključa."
  },
  {
    question: "Kaj prepoveduje tretja normalna forma (3NF)?",
    options: [
      "Transitivne funkcionalne odvisnosti med atributi",
      "Večvrednostne atribute",
      "Primarne ključe brez atributov",
      "Vse tabele morajo imeti en atribut"
    ],
    correctAnswer: "A",
    explanation: "3NF odstranjuje tranzitivne odvisnosti med atributi."
  },
  {
    question: "Kaj pomeni Boyce-Coddova normalna forma (BCNF)?",
    options: [
      "Vsaka funkcionalna odvisnost ima kandidatni ključ kot determinant",
      "Prepoveduje večvrednostne atribute",
      "Vse tabele so brez podvajanja",
      "Je nižja stopnja normalizacije"
    ],
    correctAnswer: "A",
    explanation: "BCNF je strožja verzija 3NF, kjer so vse determinantne funkcionalne odvisnosti kandidatni ključi."
  },
  {
    question: "Kaj pomeni denormalizacija?",
    options: [
      "Povečanje redundance za hitrejše poizvedbe",
      "Odstranitev atributov iz tabele",
      "Povečanje normalnih oblik",
      "Zmanjšanje velikosti baze"
    ],
    correctAnswer: "A",
    explanation: "Denormalizacija namenoma poveča redundanco za izboljšanje zmogljivosti."
  },
  {
    question: "Zakaj je normalizacija pomembna?",
    options: [
      "Zaradi lažjega pisanja poizvedb",
      "Zaradi zmanjšanja podvajanja in izboljšanja integritete podatkov",
      "Zaradi povečanja hitrosti zapisovanja",
      "Zaradi zmanjšanja števila tabel"
    ],
    correctAnswer: "B",
    explanation: "Normalizacija zmanjša redundanco in izboljša podatkovno integriteto."
  },
  {
    question: "Kaj pomeni funkcionalna odvisnost?",
    options: [
      "Vrednost enega atributa določa vrednost drugega atributa",
      "Dva atributa imata enako vrednost",
      "Atribut je primarni ključ",
      "Atribut nima vrednosti"
    ],
    correctAnswer: "A",
    explanation: "Funkcionalna odvisnost pomeni, da ena vrednost atributa določa vrednost drugega."
  },
  {
    question: "Kaj je primer večvrednostne odvisnosti?",
    options: [
      "En atribut je odvisen od več drugih neodvisnih atributov",
      "En atribut ima več vrednosti, ki niso povezane z drugimi atributi",
      "Vsi atributi so enolični",
      "Tabela vsebuje samo primarni ključ"
    ],
    correctAnswer: "B",
    explanation: "Večvrednostna odvisnost pomeni, da atribut vsebuje več vrednosti, ki niso povezane z ostalimi atributi."
  },
  {
    question: "Katera normalna forma zahteva odstranitev večvrednostnih odvisnosti?",
    options: [
      "4NF",
      "3NF",
      "BCNF",
      "1NF"
    ],
    correctAnswer: "A",
    explanation: "Četrta normalna forma (4NF) zahteva odstranitev večvrednostnih odvisnosti."
  },
  {
    question: "Kaj pomeni tranzitivna odvisnost v kontekstu normalizacije?",
    options: [
      "Atribut je odvisen od drugega atributa, ki ni primarni ključ",
      "Atribut je del primarnega ključa",
      "Vsi atributi so neodvisni",
      "Tabela ima samo en primarni ključ"
    ],
    correctAnswer: "A",
    explanation: "Tranzitivna odvisnost pomeni, da je atribut posredno odvisen od primarnega ključa preko drugega atributa."
  },
  {
    question: "Kaj se zgodi, če tabela ni normalizirana?",
    options: [
      "Poveča se redundanca in možnost anomalij pri vstavljanju, posodabljanju in brisanju",
      "Poveča se hitrost poizvedb",
      "Zmanjša se velikost baze",
      "Izboljša se varnost"
    ],
    correctAnswer: "A",
    explanation: "Nenormalizirane tabele lahko povzročijo redundantne podatke in anomalije."
  },
  {
    question: "Kateri problem rešuje normalizacija?",
    options: [
      "Anomalije posodabljanja, vstavljanja in brisanja",
      "Napake v sintaksi SQL",
      "Nezdružljivost podatkovnih tipov",
      "Zmanjšanje varnosti baze"
    ],
    correctAnswer: "A",
    explanation: "Normalizacija pomaga odpraviti različne vrste anomalij."
  },
  {
    question: "Kaj pomeni atomski atribut?",
    options: [
      "Atribut, ki ni deljen na manjše enote",
      "Atribut, ki je večvrednostni",
      "Atribut, ki vsebuje samo številke",
      "Atribut, ki je tuj ključ"
    ],
    correctAnswer: "A",
    explanation: "Atomski atribut je nedeljiv in vsebuje eno vrednost."
  },
  {
    question: "Kateri korak je običajno prvi pri normalizaciji?",
    options: [
      "Prehod v 1NF",
      "Prehod v 3NF",
      "Denormalizacija",
      "Odstranitev primarnih ključev"
    ],
    correctAnswer: "A",
    explanation: "Prvi korak je zagotavljanje, da tabela ustreza prvi normalni formi."
  },
  {
    question: "Kaj pomeni 'partial dependency' (delna odvisnost)?",
    options: [
      "Atribut je odvisen od dela sestavljenega ključa",
      "Atribut je odvisen od celotnega ključa",
      "Tabela nima ključa",
      "Atribut je odvisen od tujega ključa"
    ],
    correctAnswer: "A",
    explanation: "Delna odvisnost pomeni, da je atribut odvisen le od dela sestavljenega ključa."
  },
  {
    question: "Kaj je cilj 4. normalne forme (4NF)?",
    options: [
      "Odstranitev večvrednostnih odvisnosti",
      "Odstranitev tranzitivnih odvisnosti",
      "Povečanje redundantnosti",
      "Združevanje tabel"
    ],
    correctAnswer: "A",
    explanation: "4NF odstranjuje večvrednostne odvisnosti za boljšo strukturo podatkov."
  },
  {
    question: "Kaj je funkcionalni odvisni atribut?",
    options: [
      "Atribut, ki je funkcionalno odvisen od primarnega ključa",
      "Atribut, ki je vedno null",
      "Atribut, ki je del tujega ključa",
      "Atribut brez vrednosti"
    ],
    correctAnswer: "A",
    explanation: "Funkcionalni odvisni atribut je tak, ki ga določajo vrednosti primarnega ključa."
  },
  {
    question: "Kaj pomeni, da tabela zadostuje BCNF?",
    options: [
      "Vsaka determinanta je kandidatni ključ",
      "Tabela nima primarnega ključa",
      "Tabela ima večvrednostne atribute",
      "Tabela ni normalizirana"
    ],
    correctAnswer: "A",
    explanation: "BCNF zahteva, da so vse determinante kandidatni ključi."
  },
  {
    question: "Kaj je namen normalizacije v procesu oblikovanja baze podatkov?",
    options: [
      "Zmanjšati podvajanje in izboljšati integriteto podatkov",
      "Povečati velikost baze",
      "Odstraniti vse tuje ključe",
      "Povečati število indeksov"
    ],
    correctAnswer: "A",
    explanation: "Normalizacija pomaga zmanjšati redundantne podatke in izboljšati integriteto."
  }
],
  'UML diagrami': [
  {
    question: "Kateri UML diagram prikazuje razrede in njihova razmerja?",
    options: [
      "Razredni diagram",
      "Sekvenčni diagram",
      "Use case diagram",
      "Aktivnostni diagram"
    ],
    correctAnswer: "A",
    explanation: "Razredni diagram prikazuje strukturo sistema."
  },
  {
    question: "Kaj prikazuje sekvenčni diagram?",
    options: [
      "Strukturo podatkov",
      "Tok programa skozi čas",
      "Interakcije med objekti",
      "Razporeditev komponent"
    ],
    correctAnswer: "C",
    explanation: "Sekvenčni diagrami prikazujeje interakcije med objekti."
  },
  {
    question: "Kaj predstavlja Use Case diagram?",
    options: [
      "Interakcije uporabnikov s sistemom",
      "Tok izvajanja algoritma",
      "Razmerja med razredi",
      "Strukturo baze podatkov"
    ],
    correctAnswer: "A",
    explanation: "Use Case diagram prikazuje funkcionalnosti sistema iz vidika uporabnika."
  },
  {
    question: "Kaj prikazuje Aktivnostni diagram?",
    options: [
      "Potek aktivnosti in procesov",
      "Interakcije med objekti",
      "Strukturo razredov",
      "Vezave med komponentami"
    ],
    correctAnswer: "A",
    explanation: "Aktivnostni diagram prikazuje potek aktivnosti in procesov."
  },
  {
    question: "Kaj je namen Komponentnega diagrama v UML?",
    options: [
      "Prikaz modulov in njihovih povezav",
      "Prikaz uporabnikov sistema",
      "Prikaz interakcije med objekti",
      "Prikaz poteka aktivnosti"
    ],
    correctAnswer: "A",
    explanation: "Komponentni diagram prikazuje module oziroma komponente sistema in njihove povezave."
  },
  {
    question: "Kaj predstavlja Stanje diagram (State Machine diagram)?",
    options: [
      "Spremembe stanj objekta skozi čas",
      "Tok programskih klicev",
      "Razmerja med entitetami",
      "Potek aktivnosti"
    ],
    correctAnswer: "A",
    explanation: "Stanje diagram prikazuje različna stanja objekta in prehode med njimi."
  },
  {
    question: "Kaj pomeni agregacija v UML razrednih diagramih?",
    options: [
      "Delno lastništvo med razredi",
      "Popolno dedovanje",
      "Interakcija med uporabniki",
      "Izvedba metode"
    ],
    correctAnswer: "A",
    explanation: "Agregacija označuje 'celoto-del' razmerje, kjer del lahko obstaja neodvisno od cele enote."
  },
  {
    question: "Kaj pomeni kompozicija v UML diagramih?",
    options: [
      "Močno lastništvo med razredi",
      "Slabša povezava med objekti",
      "Izmenjava sporočil",
      "Dedovanje lastnosti"
    ],
    correctAnswer: "A",
    explanation: "Kompozicija pomeni močno lastništvo; del ne more obstajati brez cele enote."
  },
  {
    question: "Kateri diagram prikazuje fizično razporeditev komponent sistema?",
    options: [
      "Razmestitveni diagram",
      "Sekvenčni diagram",
      "Razredni diagram",
      "Use Case diagram"
    ],
    correctAnswer: "A",
    explanation: "Razmestitveni diagram prikazuje, kje so fizično nameščene komponente sistema."
  },
  {
    question: "Kaj prikazuje komunikacijski diagram?",
    options: [
      "Interakcije in sporočila med objekti",
      "Potek aktivnosti",
      "Strukturo razredov",
      "Uporabniške zahteve"
    ],
    correctAnswer: "A",
    explanation: "Komunikacijski diagram prikazuje sporočila, ki si jih objekti izmenjujejo."
  },
  {
    question: "Kaj je v UML diagramu predstavljeno z likom igralca (actor)?",
    options: [
      "Uporabnik ali sistem zunaj sistema",
      "Razred v sistemu",
      "Notranja metoda",
      "Sporočilo med objekti"
    ],
    correctAnswer: "A",
    explanation: "Igralec predstavlja entiteto zunaj sistema, ki sodeluje z njim."
  },
  {
    question: "Kaj označuje puščica z odprtim trikotnikom v UML razrednem diagramu?",
    options: [
      "Dedovanje (generalizacija)",
      "Agregacijo",
      "Asociacijo",
      "Kompozicijo"
    ],
    correctAnswer: "A",
    explanation: "Odprti trikotnik označuje dedovanje med razredi."
  },
  {
    question: "Kaj predstavlja asociacija v UML razrednih diagramih?",
    options: [
      "Povezavo med objekti ali razredi",
      "Dedovanje lastnosti",
      "Potek aktivnosti",
      "Fizično namestitev komponent"
    ],
    correctAnswer: "A",
    explanation: "Asociacija predstavlja povezavo oziroma zvezo med objekti."
  },
  {
    question: "Kaj pomeni multiplicitet v UML diagramih?",
    options: [
      "Koliko instanc enega razreda je lahko povezano z instanco drugega",
      "Število metod v razredu",
      "Število atributov v razredu",
      "Število diagramov v modelu"
    ],
    correctAnswer: "A",
    explanation: "Multiplicitet določa število povezanih instanc med razredi."
  },
  {
    question: "Kaj pomeni generalizacija v UML?",
    options: [
      "Dedovanje lastnosti od nadrazreda k podrazredu",
      "Povezava med uporabnikom in sistemom",
      "Razporeditev komponent",
      "Tok aktivnosti"
    ],
    correctAnswer: "A",
    explanation: "Generalizacija je dedovanje lastnosti in metod."
  },
  {
    question: "Kaj prikazuje paket (package) v UML diagramih?",
    options: [
      "Skupino povezanih elementov",
      "Posamezen razred",
      "Zunanjo entiteto",
      "Metode razreda"
    ],
    correctAnswer: "A",
    explanation: "Paket združuje sorodne elemente za boljšo organizacijo."
  },
  {
    question: "Kateri UML diagram najbolje prikaže interakcijo v času med objekti?",
    options: [
      "Sekvenčni diagram",
      "Razredni diagram",
      "Use Case diagram",
      "Paketni diagram"
    ],
    correctAnswer: "A",
    explanation: "Sekvenčni diagram prikazuje potek sporočil skozi čas."
  },
  {
    question: "Kaj je razlika med agregacijo in kompozicijo v UML?",
    options: [
      "Agregacija omogoča obstoj dela brez celote, kompozicija ne",
      "Agregacija je močna lastnost, kompozicija pa šibka",
      "Agregacija je za dedovanje, kompozicija za povezave",
      "Noben od navedenih odgovorov ni pravilen"
    ],
    correctAnswer: "A",
    explanation: "Agregacija dovoljuje obstoj delov neodvisno od celote, kompozicija pa ne."
  },
  {
    question: "Kaj pomeni 'lifecycle' v kontekstu UML stanje-diagrama?",
    options: [
      "Različna stanja in prehodi objekta skozi čas",
      "Število instanc razreda",
      "Število atributov v objektu",
      "Število uporabnikov sistema"
    ],
    correctAnswer: "A",
    explanation: "Lifecycle opisuje prehode in spremembe stanj objekta."
  }
],
   'Relacijska baza': [
  {
    question: "Katera SQL klavzula se uporablja za izbor podatkov?",
    options: ["SELECT", "UPDATE", "DELETE", "INSERT"],
    correctAnswer: "A",
    explanation: "SELECT se uporablja za poizvedbe."
  },
  {
    question: "Katera klavzula omeji rezultate poizvedbe?",
    options: ["LIMIT", "WHERE", "HAVING", "GROUP BY"],
    correctAnswer: "A",
    explanation: "LIMIT omeji število vrnjenih vrstic."
  },
  {
    question: "Katera klavzula filtrira vrstice glede na določene pogoje?",
    options: ["WHERE", "GROUP BY", "ORDER BY", "HAVING"],
    correctAnswer: "A",
    explanation: "WHERE filtrira vrstice pred združevanjem."
  },
  {
    question: "Za kaj se uporablja klavzula GROUP BY?",
    options: ["Za združevanje vrstic glede na en ali več stolpcev", "Za filtriranje vrstic", "Za urejanje vrstic", "Za brisanje podatkov"],
    correctAnswer: "A",
    explanation: "GROUP BY združi vrstice s skupnimi vrednostmi."
  },
  {
    question: "Katera klavzula filtrira rezultate združenih skupin?",
    options: ["HAVING", "WHERE", "ORDER BY", "LIMIT"],
    correctAnswer: "A",
    explanation: "HAVING filtrira rezultate po GROUP BY."
  },
  {
    question: "Kaj naredi ukaz INSERT?",
    options: ["Doda nove podatke v tabelo", "Posodobi obstoječe podatke", "Izbriše podatke", "Izbere podatke"],
    correctAnswer: "A",
    explanation: "INSERT doda nove vrstice v tabelo."
  },
  {
    question: "Kaj naredi ukaz UPDATE?",
    options: ["Posodobi podatke v tabeli", "Doda nove podatke", "Izbriše tabelo", "Izbere podatke"],
    correctAnswer: "A",
    explanation: "UPDATE spreminja obstoječe podatke."
  },
  {
    question: "Katera klavzula določa vrstni red vrnjenih rezultatov?",
    options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"],
    correctAnswer: "A",
    explanation: "ORDER BY ureja rezultate po določenem stolpcu."
  },
  {
    question: "Kaj predstavlja primarni ključ (PRIMARY KEY)?",
    options: ["Enolični identifikator vrstice v tabeli", "Tuji ključ", "Stolpec z dvojnimi vrednostmi", "Index"],
    correctAnswer: "A",
    explanation: "PRIMARY KEY zagotavlja enoličnost vrstice."
  },
  {
    question: "Kaj je tuji ključ (FOREIGN KEY)?",
    options: ["Stolpec, ki se povezuje na primarni ključ druge tabele", "Stolpec z unikatnimi vrednostmi", "Glavni ključ tabele", "Indeks"],
    correctAnswer: "A",
    explanation: "FOREIGN KEY povezuje tabele med sabo."
  },
  {
    question: "Kaj pomeni relacija 1:N v relacijski bazi?",
    options: ["Ena vrstica iz prve tabele je povezana z več vrsticami v drugi tabeli", "Ena vrstica je povezana z eno vrstico", "Več vrstic z eno vrstico", "Ni povezave"],
    correctAnswer: "A",
    explanation: "1:N pomeni eno-na-več relacijo."
  },
  {
    question: "Kateri ukaz izbriše tabelo iz baze podatkov?",
    options: ["DROP TABLE", "DELETE", "REMOVE", "TRUNCATE"],
    correctAnswer: "A",
    explanation: "DROP TABLE izbriše celotno tabelo."
  },
  {
    question: "Kaj naredi ukaz DELETE?",
    options: ["Izbriše vrstice iz tabele", "Izbriše tabelo", "Dodaja vrstice", "Posodablja vrstice"],
    correctAnswer: "A",
    explanation: "DELETE izbriše posamezne vrstice."
  },
  {
    question: "Kaj pomeni normalizacija v relacijskih bazah?",
    options: ["Odstranjevanje podvajanja podatkov in optimizacija strukture", "Povečanje hitrosti poizvedb", "Ustvarjanje varnostnih kopij", "Urejanje podatkov po abecedi"],
    correctAnswer: "A",
    explanation: "Normalizacija zmanjšuje redundanco."
  },
  {
    question: "Kaj je indeks v bazi podatkov?",
    options: ["Struktura za pospeševanje poizvedb", "Vrstica v tabeli", "Stolpec s podatki", "Vrsta ključa"],
    correctAnswer: "A",
    explanation: "Indeks pospeši iskanje podatkov."
  },
  {
    question: "Kaj pomeni klavzula DISTINCT v SQL?",
    options: ["Izbere samo unikatne vrednosti", "Izbere vse vrstice", "Združi vrstice", "Uredi vrstice"],
    correctAnswer: "A",
    explanation: "DISTINCT odstrani podvojene vrstice."
  },
  {
    question: "Kaj pomeni JOIN v SQL?",
    options: ["Združevanje podatkov iz več tabel", "Brisanje podatkov", "Posodabljanje podatkov", "Vstavljanje podatkov"],
    correctAnswer: "A",
    explanation: "JOIN poveže tabele glede na skupne stolpce."
  },
  {
    question: "Katera vrsta JOIN vrne vse vrstice iz leve tabele in ustrezne iz desne?",
    options: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "FULL JOIN"],
    correctAnswer: "A",
    explanation: "LEFT JOIN vrne vse vrstice iz leve tabele."
  },
  {
    question: "Kaj pomeni transakcija v relacijski bazi podatkov?",
    options: [
      "Niz SQL operacij, ki se izvajajo kot ena enota",
      "Ena poizvedba",
      "Urejanje tabele",
      "Brisanje podatkov"
    ],
    correctAnswer: "A",
    explanation: "Transakcija zagotavlja atomarnost operacij."
  },
  {
    question: "Kaj pomeni ACID v kontekstu baz podatkov?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Add, Commit, Insert, Delete",
      "Aggregate, Count, Index, Data",
      "Assign, Connect, Identify, Define"
    ],
    correctAnswer: "A",
    explanation: "ACID so ključna načela za zanesljive transakcije."
  }
],
   'CRUD operacije': [
  {
    question: "Kaj pomeni C v CRUD?",
    options: ["Create", "Copy", "Calculate", "Compare"],
    correctAnswer: "A",
    explanation: "CRUD = Create, Read, Update, Delete."
  },
  {
    question: "Katera SQL operacija ustreza Read v CRUD?",
    options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
    correctAnswer: "B",
    explanation: "SELECT se uporablja za branje podatkov."
  },
  {
    question: "Katera SQL operacija ustreza Update v CRUD?",
    options: ["UPDATE", "INSERT", "SELECT", "DELETE"],
    correctAnswer: "A",
    explanation: "UPDATE spreminja obstoječe podatke."
  },
  {
    question: "Katera SQL operacija ustreza Delete v CRUD?",
    options: ["DELETE", "UPDATE", "INSERT", "SELECT"],
    correctAnswer: "A",
    explanation: "DELETE izbriše podatke iz baze."
  },
  {
    question: "Kaj pomeni Read v CRUD?",
    options: [
      "Branje podatkov iz baze",
      "Ustvarjanje novih podatkov",
      "Posodabljanje podatkov",
      "Brisanje podatkov"
    ],
    correctAnswer: "A",
    explanation: "Read pomeni branje podatkov."
  },
  {
    question: "Kaj pomeni Create v CRUD?",
    options: [
      "Ustvarjanje novih zapisov v bazi",
      "Branje zapisov iz baze",
      "Posodabljanje obstoječih zapisov",
      "Brisanje zapisov"
    ],
    correctAnswer: "A",
    explanation: "Create pomeni ustvarjanje novih zapisov."
  },
  {
    question: "Kaj pomeni Update v CRUD?",
    options: [
      "Posodabljanje obstoječih zapisov v bazi",
      "Ustvarjanje novih zapisov",
      "Brisanje zapisov",
      "Branje zapisov"
    ],
    correctAnswer: "A",
    explanation: "Update pomeni spreminjanje podatkov."
  },
  {
    question: "Kaj pomeni Delete v CRUD?",
    options: [
      "Brisanje zapisov iz baze",
      "Ustvarjanje novih zapisov",
      "Posodabljanje podatkov",
      "Branje podatkov"
    ],
    correctAnswer: "A",
    explanation: "Delete pomeni odstranitev podatkov."
  },
  {
    question: "Katera CRUD operacija je običajno najhitrejša?",
    options: ["Read", "Create", "Update", "Delete"],
    correctAnswer: "A",
    explanation: "Branje (Read) je običajno najhitrejše."
  },
  {
    question: "Katere CRUD operacije so potrebne za popolno upravljanje s podatki?",
    options: [
      "Create, Read, Update, Delete",
      "Copy, Read, Undo, Delete",
      "Create, Rename, Update, Move",
      "Connect, Read, Update, Delete"
    ],
    correctAnswer: "A",
    explanation: "CRUD zajema vse osnovne operacije nad podatki."
  },
  {
    question: "Kaj se običajno zgodi pri operaciji Create?",
    options: [
      "Dodajo se novi podatki v bazo",
      "Podatki se izbrišejo",
      "Podatki se posodobijo",
      "Podatki se preberejo"
    ],
    correctAnswer: "A",
    explanation: "Pri Create dodajamo nove podatke."
  },
  {
    question: "Kaj je pogosta SQL napaka pri operaciji Update?",
    options: [
      "Pozabljena WHERE klavzula, kar vodi do posodobitve vseh vrstic",
      "Napaka v sintaksi SELECT",
      "Izguba povezave z bazo",
      "Manjkajoči indeks"
    ],
    correctAnswer: "A",
    explanation: "Brez WHERE se posodobijo vse vrstice."
  },
  {
    question: "Kako preprečimo, da operacija Delete izbriše vse vrstice?",
    options: [
      "Uporaba WHERE klavzule za omejitev izbire vrstic",
      "Uporaba GROUP BY",
      "Uporaba ORDER BY",
      "Uporaba LIMIT"
    ],
    correctAnswer: "A",
    explanation: "WHERE klavzula omeji vrstice za brisanje."
  },
  {
    question: "Kaj pomeni tranzakcija v kontekstu CRUD operacij?",
    options: [
      "Niz operacij, ki se izvedejo skupaj ali sploh ne",
      "Posamezna operacija Create",
      "Branje podatkov",
      "Izbira podatkov"
    ],
    correctAnswer: "A",
    explanation: "Transakcija zagotavlja celovitost podatkov."
  },
  {
    question: "Kateri CRUD ukaz običajno povzroči spremembo stanja baze?",
    options: ["Create", "Read", "Select", "Show"],
    correctAnswer: "A",
    explanation: "Create spremeni stanje baze z dodajanjem podatkov."
  },
  {
    question: "Kaj se zgodi, če pri operaciji Update ne uporabimo WHERE?",
    options: [
      "Posodobijo se vse vrstice v tabeli",
      "Posodobijo se samo prve vrstice",
      "Napaka v poizvedbi",
      "Baza podatkov se resetira"
    ],
    correctAnswer: "A",
    explanation: "Brez WHERE se posodobijo vse vrstice."
  },
  {
    question: "Kaj je primarni namen CRUD operacij?",
    options: [
      "Upravljanje življenjskega cikla podatkov",
      "Ustvarjanje varnostnih kopij",
      "Optimizacija baze",
      "Obdelava uporabniških zahtev"
    ],
    correctAnswer: "A",
    explanation: "CRUD upravlja ustvarjanje, branje, posodabljanje in brisanje podatkov."
  },
  {
    question: "Kateri CRUD ukaz ne spreminja podatkov v bazi?",
    options: ["Read", "Create", "Update", "Delete"],
    correctAnswer: "A",
    explanation: "Read (SELECT) samo prebere podatke."
  },
  {
    question: "Kaj pomeni REST v kontekstu CRUD?",
    options: [
      "Representational State Transfer",
      "Rapid Execution Service Technique",
      "Random Event State Tracker",
      "Relational Server Transfer"
    ],
    correctAnswer: "A",
    explanation: "REST je arhitektura za spletne storitve."
  }
]},}
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    // First try to get a predefined exercise based on prompt
    const predefined = getPredefinedExercise(prompt);
    if (predefined) {
      return NextResponse.json(predefined);
    }

    // If no predefined, try Hugging Face API
    if (process.env.HF_API_KEY) {
      try {
        const hfResponse = await tryHuggingFace(prompt);
        if (hfResponse) {
          return NextResponse.json(hfResponse);
        }
      } catch (hfError) {
        console.log("Hugging Face failed, using fallback:", hfError);
      }
    }

    // Final fallback
    return NextResponse.json(getGenericFallback(prompt));

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      getGenericFallback(""),
      { status: 200 }
    );
  }
}

function getPredefinedExercise(prompt: string): Exercise | null {
  try {
    // Improved extraction of subject and category
    const subjectMatch = prompt.match(/predmeta\s+([^\n]+?)\s+na/i) || 
                        prompt.match(/predmeta\s+([^\n]+)/i);
    const categoryMatch = prompt.match(/temo\s+([^\n]+?)\s+v/i) || 
                         prompt.match(/temo\s+([^\n]+)/i);
    
    const subject = subjectMatch?.[1]?.trim() || 'Matematika';
    const category = categoryMatch?.[1]?.trim() || 'Kvadratne enačbe';
    
    console.log("Extracted:", {subject, category}); // Debug logging
    
    // Type-safe access to exercises
    if (subject in FALLBACK_EXERCISES) {
      const subjectExercises = FALLBACK_EXERCISES[subject];
      if (category in subjectExercises) {
        const questions = subjectExercises[category];
        return questions[Math.floor(Math.random() * questions.length)];
      }
      
      // Fallback to first category if specific category not found
      const firstCategory = Object.keys(subjectExercises)[0];
      if (firstCategory) {
        const questions = subjectExercises[firstCategory];
        return questions[Math.floor(Math.random() * questions.length)];
      }
    }
  } catch (e) {
    console.log("Error getting predefined exercise:", e);
  }
  return null;
}

async function tryHuggingFace(prompt: string) {
  const HF_API_URL = `https://api-inference.huggingface.co/models/google/flan-t5-xl`;
  
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.7,
        top_p: 0.9
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  const generatedText = result[0]?.generated_text || "";

  if (!generatedText) {
    throw new Error("Empty response from API");
  }

  return parseGeneratedText(generatedText);
}

function parseGeneratedText(text: string) {
  // Implement very tolerant parsing
  const lines = text.split('\n').filter(line => line.trim());
  
  // Get first non-empty line as question
  const question = lines[0]?.trim() || "Reši enačbo";
  
  // Find options (lines starting with A), B), etc.)
  const options = [];
  for (let i = 1; i < lines.length && options.length < 4; i++) {
    const optionMatch = lines[i].match(/^([A-D])[\)\.]\s*(.+)/i);
    if (optionMatch) {
      options.push(optionMatch[2].trim());
    }
  }
  
  // Fill missing options
  while (options.length < 4) {
    options.push(`Možnost ${options.length + 1}`);
  }

  // Try to find correct answer (look for "Pravilen: A" pattern)
  let correctAnswer = "A";
  for (const line of lines) {
    const answerMatch = line.match(/Pravilen\s*(odgovor)?:\s*([A-D])/i);
    if (answerMatch) {
      correctAnswer = answerMatch[2].toUpperCase();
      break;
    }
  }

  // Use last non-option line as explanation
  let explanation = "Rešitev ni na voljo";
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].match(/^[A-D][\)\.]/i)) {
      explanation = lines[i].trim();
      break;
    }
  }

  return {
    question,
    options,
    correctAnswer,
    explanation
  };
}

function getGenericFallback(prompt: string) {
  // Try to extract subject from prompt
  const isProgramming = prompt.includes('Programiranje');
  const isIS = prompt.includes('Informacijski sistemi');
  
  if (isProgramming) {
    const questions = FALLBACK_EXERCISES['Programiranje']['OOP'];
    return questions[Math.floor(Math.random() * questions.length)];
  } else if (isIS) {
    const questions = FALLBACK_EXERCISES['Informacijski sistemi']['ER modeli'];
    return questions[Math.floor(Math.random() * questions.length)];
  } else {
    const questions = FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe'];
    return questions[Math.floor(Math.random() * questions.length)];
  }
}