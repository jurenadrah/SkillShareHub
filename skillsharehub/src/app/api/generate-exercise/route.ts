import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { subject, category } = await request.json()

    // Preverimo vhodne podatke
    if (!subject || !category) {
      return NextResponse.json(
        { error: 'Manjkajo subject ali category' },
        { status: 400 }
      )
    }

    const prompt = `Ustvari šolsko nalogo za predmet ${subject} in kategorijo ${category} v slovenskem jeziku. 
    Naloga naj bo primerna za srednješolce. Vrni samo JSON objekt z dvema poljema: 
    "question" (vprašanje/naloga) in "solution" (rešitev).`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Si učitelj, ki ustvarja izobraževalne naloge za slovenske šolarje." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    
    if (!content) {
      throw new Error('AI ni vrnil vsebine')
    }

    const result = JSON.parse(content)
    
    return NextResponse.json({
      question: result.question || "Primer naloge",
      solution: result.solution || "Primer rešitve"
    })

  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { 
        error: 'Napaka pri generiranju naloge',
        details: error instanceof Error ? error.message : 'Neznana napaka'
      },
      { status: 500 }
    )
  }
}