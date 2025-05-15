import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { groq } from '@ai-sdk/groq';
import { Message, StreamingTextResponse, experimental_streamText } from 'ai';
import { NextRequest } from 'next/server';

// The maximum duration for streaming responses
export const maxDuration = 60;

// Define function tools
const functionTools = [
  {
    name: 'get_current_weather',
    description: 'Get the current weather',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The unit of temperature',
        },
      },
      required: ['location'],
    },
  },
  {
    name: 'search_code_repository',
    description: 'Search for code in the repository',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query for code, e.g. "authentication function"',
        },
        language: {
          type: 'string',
          description: 'The programming language to filter by',
        },
      },
      required: ['query'],
    },
  },
];

// Mock function implementations
async function getWeather(location: string, unit = 'celsius') {
  // In a real application, this would call a weather API
  return {
    location,
    temperature: unit === 'celsius' ? 22 : 72,
    unit,
    forecast: 'Sunny',
    humidity: '45%',
  };
}

async function handleFunctionCall(name: string, args: any) {
  console.log(`Handling function call: ${name}`, args);
  
  switch (name) {
    case 'get_current_weather':
      return await getWeather(args.location, args.unit);
    case 'search_code_repository':
      // Mock implementation
      return {
        results: [
          { file: 'src/auth.ts', snippet: 'function authenticate(user, password) { ... }' },
          { file: 'src/utils/security.ts', snippet: 'export const validateToken = (token) => { ... }' },
        ],
        count: 2,
      };
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'openai', provider = 'gpt-4o', temperature = 0.7, tools = false } = await req.json();

    let aiProvider: any;
    let aiModel: string;

    // Select the AI provider and model
    switch (model) {
      case 'openai':
        aiProvider = openai;
        aiModel = provider || 'gpt-4o';
        break;
      case 'anthropic':
        aiProvider = anthropic;
        aiModel = provider || 'claude-3-opus-20240229';
        break;
      case 'groq':
        aiProvider = groq;
        aiModel = provider || 'llama-3.1-8b-instant';
        break;
      default:
        aiProvider = openai;
        aiModel = 'gpt-4o';
    }

    // Enhanced system message
    const systemMessage = `You are an intelligent assistant for developers and engineers. 
Be concise, helpful, and provide code examples when appropriate. 
Current time: ${new Date().toISOString()}`;

    // If tools are enabled
    if (tools) {
      const { stream, experimental_onToolCall } = experimental_streamText({
        model: aiProvider(aiModel),
        messages: messages as Message[],
        temperature,
        system: systemMessage,
        tools: functionTools,
      });

      // Handle tool calls
      experimental_onToolCall(async (toolCall) => {
        const { name, parameters } = toolCall;
        try {
          const result = await handleFunctionCall(name, parameters);
          return { content: JSON.stringify(result) };
        } catch (error) {
          console.error(`Error executing function ${name}:`, error);
          return {
            content: JSON.stringify({ error: `Failed to execute function ${name}` }),
          };
        }
      });

      return new StreamingTextResponse(stream);
    } else {
      // Standard text completion without tools
      const response = await experimental_streamText({
        model: aiProvider(aiModel),
        messages: messages as Message[],
        temperature,
        system: systemMessage,
      });

      return new StreamingTextResponse(response.stream);
    }
  } catch (error) {
    console.error('AI Assistant API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'There was an error processing your request',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}