// route.test.ts
import { POST } from './route';
import { NextResponse } from 'next/server';
import { FALLBACK_EXERCISES } from './route';

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
    expect(FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe']).toContainEqual(data);
  });

  it('should fallback to first category when specific category not found', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        prompt: 'Ustvari vajo za predmeta Matematika na temo Neobstoječa tema'
      }),
    };

    const response = await POST(request as any);
    const data = await response.json();

    const firstCategory = Object.keys(FALLBACK_EXERCISES['Matematika'])[0];
    expect(FALLBACK_EXERCISES['Matematika'][firstCategory]).toContainEqual(data);
  });

  it('should try Hugging Face API when no predefined exercise found and API key exists', async () => {
    process.env.HF_API_KEY = 'test-key';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([{ generated_text: 'Question\nA) Option 1\nB) Option 2\nC) Option 3\nD) Option 4\nPravilen: A\nExplanation' }])
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

    // Should fall back to either Matematika or Programiranje or IS
    expect(data).toHaveProperty('question');
    expect(data).toHaveProperty('options');
    expect(data).toHaveProperty('correctAnswer');
    expect(data).toHaveProperty('explanation');
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
});

describe('Helper functions', () => {
  describe('getPredefinedExercise', () => {
    const { getPredefinedExercise } = require('./route');

    it('should extract subject and category from prompt', () => {
      const prompt = 'Ustvari vajo za predmeta Matematika na temo Kvadratne enačbe';
      const result = getPredefinedExercise(prompt);
      
      expect(result).toBeDefined();
      expect(FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe']).toContainEqual(result);
    });

    it('should handle variations in prompt format', () => {
      const prompt1 = 'Naredi vajo iz predmeta Programiranje';
      const prompt2 = 'Vaja za temo OOP v predmetu Programiranje';
      
      const result1 = getPredefinedExercise(prompt1);
      const result2 = getPredefinedExercise(prompt2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should return null when no match found', () => {
      const prompt = 'Ustvari vajo za predmeta Neobstoječ predmet';
      const result = getPredefinedExercise(prompt);
      
      expect(result).toBeNull();
    });
  });

  describe('parseGeneratedText', () => {
    const { parseGeneratedText } = require('./route');

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

    it('should handle incomplete generated text', () => {
      const text = `Kaj je glavno mesto Slovenije?
A) Ljubljana
B) Maribor`;

      const result = parseGeneratedText(text);
      
      expect(result.question).toBe('Kaj je glavno mesto Slovenije?');
      expect(result.options.length).toBe(4); // Should fill missing options
      expect(['A', 'B', 'C', 'D']).toContain(result.correctAnswer);
    });
  });

  describe('getGenericFallback', () => {
    const { getGenericFallback } = require('./route');

    it('should return math exercise for other prompts', () => {
      const prompt = 'Naredi vajo';
      const result = getGenericFallback(prompt);
      
      expect(FALLBACK_EXERCISES['Matematika']['Kvadratne enačbe']).toContainEqual(result);
    });
  });
});