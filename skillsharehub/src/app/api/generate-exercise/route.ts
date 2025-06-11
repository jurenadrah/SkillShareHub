// app/api/generate-exercise/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

export async function POST(request: Request) {
  try {
    // Preveritev API ključa
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Manjka OpenAI API ključ');
    }

    const { subject, category } = await request.json();
    
    // Validacija vhodnih podatkov
    if (!subject || !category) {
      return NextResponse.json(
        { error: 'Manjkajo subject ali category' },
        { status: 400 }
      );
    }

    const prompt = `Ustvari konkretno programersko nalogo o temi ${category} v slovenskem jeziku. 
    Naloga naj bo praktična in primerna za srednješolce. Vrni JSON: { "question": "naloga", "solution": "rešitev" }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Si strokovnjak za programiranje, ki ustvarja praktične vaje." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) throw new Error('AI ni vrnil odgovora');
    
    const result = JSON.parse(content);
    
    if (!result.question || !result.solution) {
      throw new Error('Neveljavna struktura odgovora');
    }

    return NextResponse.json({
      question: result.question,
      solution: result.solution
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Napaka pri generiranju naloge',
        details: error instanceof Error ? error.message : 'Neznana napaka'
      },
      { status: 500 }
    );
  }
}