import { experimental_createMCPClient, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  let collectedContent = '';
  let stdioClient: any;

  try {
    // First LLM call with tools
    const transport = new Experimental_StdioMCPTransport({
      command: 'bun',
      args: ['src/stdio/dist/server.mjs'],
    });
    
    stdioClient = await experimental_createMCPClient({
      transport,
    });

    const toolSetOne = await stdioClient.tools();
    const tools = {
      ...toolSetOne, 
    };

    const response = await streamText({
      model: groq('llama-3.1-8b-instant'),
      prompt,
      tools,
      onFinish: async () => {
        await stdioClient.close();
      },
    });

    // Collect the content from first stream
    // ... existing code ...
    const streamResponse = response.toDataStreamResponse();
    if (streamResponse.body) {
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        // ... existing code ...
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Check if the chunk starts with 'a:' and extract the JSON part
          const aIndex = chunk.indexOf('a:');
          if (aIndex !== -1) {
            const jsonPart = chunk.slice(aIndex + 2).trim();
            try {
              const aObj = JSON.parse(jsonPart);
              if (
                aObj.result &&
                Array.isArray(aObj.result.content) &&
                aObj.result.content.length > 0 &&
                aObj.result.content[0].type === 'text'
              ) {
                collectedContent += aObj.result.content[0].text;
              }
            } catch {
              // Not valid JSON, ignore
            }
          }
        }
// ... existing code ...
      }
    }
// ... existing code ...

    // Second LLM call using collected content as context
    const contextPrompt = `
Previous analysis result:
${collectedContent}

Based on the above analysis, please provide a detailed summary of the changes and their potential impact.`;
    console.log('Context Prompt:', contextPrompt);
    const analysisResponse = await streamText({
      model: groq('llama-3.1-8b-instant'),
      prompt: contextPrompt,
      // No tools needed for analysis
    });

    // Return the analysis response
    return analysisResponse.toDataStreamResponse();

  } catch (error) {
    console.error('Error:', error);
    if (stdioClient) {
      await stdioClient.close().catch((e: Error) => console.error('Error closing client:', e));
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}