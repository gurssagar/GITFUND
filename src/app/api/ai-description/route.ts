import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from "ai";
export async function POST(req: NextRequest) {
  const { repoValue } = await req.json();
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not set' }, { status: 500 });
  }
  try {
    // Replace with your actual AI API logic
    const google = createGoogleGenerativeAI({ apiKey });
    const { text } = await generateText({
      model: google('models/gemini-2.0-flash'),
      messages: [
        {
          role: 'user',
          content: `Analyze this project repository and create a concise developer-friendly summary (300 words max) that includes:
                                1. Main purpose and functionality
                                2. Key technologies used
                                3. Project structure overview
                                4. Setup instructions (if any)
                                5. Contribution guidelines (if any)

                                Repository README content: ${repoValue}`
        }
      ],
    });
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}