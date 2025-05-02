import { experimental_createMCPClient, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { groq } from '@ai-sdk/groq';

export default async function handler(req:Request, res:Response) {
  if (req.method === 'POST') {
    // Process the webhook payload
    const payload = req.body;
    // Do something with the payload (e.g., log it or save it in the database)
    console.log('Webhook received:', payload);
    // Send a response to acknowledge receipt of the webhook
    res.status(200).json({ message: 'Webhook received successfully' });
  } else {
    // Respond with a 405 Method Not Allowed if the method is not POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}