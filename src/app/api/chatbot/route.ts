import { experimental_createMCPClient, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  const consts = await req.json();
  console.log(consts);
}