// route.test.ts
import { POST } from './route';
import { NextResponse } from 'next/server';
import { 
  FALLBACK_EXERCISES, 
  getPredefinedExercise, 
  parseGeneratedText, 
  getGenericFallback 
} from './helpers';

// Mock za fetch (Hugging Face API)
global.fetch = jest.fn() as jest.Mock;

// Mock za NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ json: () => Promise.resolve(data) })),
  },
}));

describe('POST handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.HF_API_KEY;
  });

  it('should return predefined exercise when subject and category match', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        prompt: 'Ustvari vajo za predmeta Matematika na temo Kvadratne enačbe'
      }),
    };

    const response = await POST(request as any);
    const data = await response.json();

    expect(request.json).toHaveBeenCalled();
    expect(data).toHaveProperty('question');
    expect(data).toHaveProperty('options');
    expect(data).toHaveProperty('correctAnswer');
    expect(data).toHaveProperty('explanation');
    
    // Check if the returned data is one of the predefined exercises
    const mathExercises = FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe'];
    expect(mathExercises.some(exercise => 
      exercise.question === data.question &&
      JSON.stringify(exercise.options) === JSON.stringify(data.options) &&
      exercise.correctAnswer === data.correctAnswer &&
      exercise.explanation === data.explanation
    )).toBe(true);
  });

  it('should fallback to first category when specific category not found', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        prompt: 'Ustvari vajo za predmeta Matematika na temo Neobstoječa tema'
      }),
    };

    const response = await POST(request as any);
    const data = await response.json();

    expect(data).toHaveProperty('question');
    expect(data).toHaveProperty('options');
    expect(data).toHaveProperty('correctAnswer');
    expect(data).toHaveProperty('explanation');

    // Should be from first category of Matematika
    const firstCategory = Object.keys(FALLBACK_EXERCISES['Matematika'])[0];
    const firstCategoryExercises = FALLBACK_EXERCISES['Matematika'][firstCategory];
    expect(firstCategoryExercises.some(exercise => 
      exercise.question === data.question
    )).toBe(true);
  });

  it('should try Hugging Face API when no predefined exercise found and API key exists', async () => {
    process.env.HF_API_KEY = 'test-key';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([{ 
        generated_text: 'Question\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\nPravilen: A\nExplanation' 
      }])
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        prompt: 'Ustvari vajo za predmeta Neobstoječ predmet'
      }),
    };

    const response = await POST(request as any);
    const data = await response.json();

    expect(fetch).toHaveBeenCalled();
    expect(data).toEqual({
      question: 'Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'A',
      explanation: 'Explanation'
    });
  });

  it('should use generic fallback when Hugging Face API fails', async () => {
    process.env.HF_API_KEY = 'test-key';
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));

    const request = {
      json: jest.fn().mockResolvedValue({
        prompt: 'Ustvari vajo za predmeta Neobstoječ predmet'
      }),
    };

    const response = await POST(request as any);
    const data = await response.json();

    // Should fall back to generic fallback (Matematika)
    expect(data).toHaveProperty('question');
    expect(data).toHaveProperty('options');
    expect(data).toHaveProperty('correctAnswer');
    expect(data).toHaveProperty('explanation');
    
    // Should be from Matematika fallback
    const mathExercises = FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe'];
    expect(mathExercises.some(exercise => 
      exercise.question === data.question
    )).toBe(true);
  });

  it('should handle errors gracefully and return fallback', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Parse error')),
    };

    const response = await POST(request as any);
    const data = await response.json();

    expect(data).toHaveProperty('question');
    expect(data).toHaveProperty('options');
    expect(data).toHaveProperty('correctAnswer');
    expect(data).toHaveProperty('explanation');
  });

  it('should use generic fallback when no HF_API_KEY is set', async () => {
    delete process.env.HF_API_KEY;

    const request = {
      json: jest.fn().mockResolvedValue({
        prompt: 'Ustvari vajo za predmeta Neobstoječ predmet'
      }),
    };

    const response = await POST(request as any);
    const data = await response.json();

    expect(fetch).not.toHaveBeenCalled();
    expect(data).toHaveProperty('question');
    
    // Should be from generic fallback
    const mathExercises = FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe'];
    expect(mathExercises.some(exercise => 
      exercise.question === data.question
    )).toBe(true);
  });
});

describe('Helper functions', () => {
  describe('getPredefinedExercise', () => {
    it('should extract subject and category from prompt', () => {
      const prompt = 'Ustvari vajo za predmeta Matematika na temo Kvadratne enačbe';
      const result = getPredefinedExercise(prompt);
      
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      if (result) {
        const mathExercises = FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe'];
        expect(mathExercises.some(exercise => 
          exercise.question === result.question
        )).toBe(true);
      }
    });

    it('should handle variations in prompt format', () => {
      const prompt1 = 'Naredi vajo iz predmeta Programiranje';
      const prompt2 = 'Vaja za temo OOP';
      
      const result1 = getPredefinedExercise(prompt1);
      const result2 = getPredefinedExercise(prompt2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should return null when subject not found in FALLBACK_EXERCISES', () => {
      const prompt = 'Ustvari vajo za predmeta Popolnoma neobstoječ predmet na temo Neobstoječa tema';
      const result = getPredefinedExercise(prompt);
      
      expect(result).toBeNull();
    });

    it('should fallback to first category when category not found', () => {
      const prompt = 'Ustvari vajo za predmeta Matematika na temo Neobstoječa tema';
      const result = getPredefinedExercise(prompt);
      
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      if (result) {
        // Should be from first category of Matematika
        const firstCategory = Object.keys(FALLBACK_EXERCISES['Matematika'])[0];
        const firstCategoryExercises = FALLBACK_EXERCISES['Matematika'][firstCategory];
        expect(firstCategoryExercises.some(exercise => 
          exercise.question === result.question
        )).toBe(true);
      }
    });
  });

  describe('parseGeneratedText', () => {
    it('should parse well-formatted generated text', () => {
      const text = `Kaj je 2+2?
A) 3
B) 4
C) 5
D) 6
Pravilen odgovor: B
To je osnovna matematika.`;

      const result = parseGeneratedText(text);
      
      expect(result).toEqual({
        question: 'Kaj je 2+2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 'B',
        explanation: 'To je osnovna matematika.'
      });
    });

    it('should handle different answer formats', () => {
      const text = `Vprašanje?
A) Možnost 1
B) Možnost 2
C) Možnost 3
D) Možnost 4
Pravilen: C
Obrazložitev`;

      const result = parseGeneratedText(text);
      
      expect(result.correctAnswer).toBe('C');
      expect(result.explanation).toBe('Obrazložitev');
    });
  });

  describe('getGenericFallback', () => {
    it('should return programming exercise for programming prompts', () => {
      const prompt = 'Naredi vajo iz Programiranje';
      const result = getGenericFallback(prompt);
      
      const programmingExercises = FALLBACK_EXERCISES['Programiranje']['OOP'];
      expect(programmingExercises.some(exercise => 
        exercise.question === result.question
      )).toBe(true);
    });

    it('should return IS exercise for IS prompts', () => {
      const prompt = 'Naredi vajo iz Informacijski sistemi';
      const result = getGenericFallback(prompt);
      
      const isExercises = FALLBACK_EXERCISES['Informacijski sistemi']['ER modeli'];
      expect(isExercises.some(exercise => 
        exercise.question === result.question
      )).toBe(true);
    });

    it('should return math exercise for other prompts', () => {
      const prompt = 'Naredi vajo';
      const result = getGenericFallback(prompt);
      
      const mathExercises = FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe'];
      expect(mathExercises.some(exercise => 
        exercise.question === result.question
      )).toBe(true);
    });
  });
});