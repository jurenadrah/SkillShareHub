import { NextResponse } from 'next/server';
import { 
  Exercise, 
  getPredefinedExercise, 
  parseGeneratedText, 
  getGenericFallback 
} from './helpers';

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

async function tryHuggingFace(prompt: string): Promise<Exercise | null> {
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