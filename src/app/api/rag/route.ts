import { NextResponse } from "next/server";
import { db } from "../../../db/index";
import { project } from "../../../db/schema";
import { Pinecone } from "@pinecone-database/pinecone";
import { InferenceClient } from "@huggingface/inference";
import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// Initialize Pinecone directly with configuration
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Initialize HuggingFace Inference Client
const hf = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN!);

// Helper function to get embeddings from HuggingFace Inference API
async function getEmbedding(text: string): Promise<number[]> {
  // Use the featureExtraction method for sentence embeddings
  const data = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  // data is [[...vector]] or [...vector]; flatten if needed
  return Array.isArray(data[0]) ? data[0] : data;
}

export async function GET() {
  try {
    const index = pinecone.index("gitfund");
    const query = db.select().from(project);
    const projectData = await query.execute();

    // Generate real embeddings for each project
    const vectors = await Promise.all(
      projectData.map(async (project, id) => {
        const embedding = await getEmbedding(project?.aiDescription as string);
        // If your Pinecone index expects 1024 dims, use a model that outputs 1024 dims
        // Or pad/truncate as needed:
        let values = embedding;
        if (embedding.length > 1024) values = embedding.slice(0, 1024);
        if (embedding.length < 1024)
          values = [
            ...embedding,
            ...new Array(1024 - embedding.length).fill(0),
          ];
        return {
          id: id.toString(),
          values,
          metadata: {
            projectName: project.projectName,
            description: project.aiDescription,
            languages: JSON.stringify(project.languages),
            owner: project.projectOwner,
          },
        };
      })
    );

    if (vectors.length > 0) {
      await index.upsert(vectors);
    }

    return NextResponse.json({
      success: true,
      message: "Data successfully sent to Pinecone",
      projectsProcessed: projectData.length,
    });
  } catch (error) {
    console.error("Error processing data for Pinecone:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: `Failed to process data: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const index = pinecone.index("gitfund");

    // ⚠️ Replace these IDs with the ones you upserted earlier (like 0, 1, 2...)
    const idsToFetch = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];

    const response = await index.fetch(idsToFetch);

    console.log("🔍 Vector data fetched from Pinecone:");
    console.log(response.records, { depth: null });
  } catch (error) {
    console.error("❌ Error fetching vector data from Pinecone:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch vector data",
      },
      { status: 500 }
    );
  }
  // its a comment
  try {
    const { messages } = await req.json();
    console.log("Messages received:", messages);
    // Get the latest user message for retrieval
    const latestUserMessage = messages
      .filter((msg: any) => msg.role === "user")
      .pop();

    if (!latestUserMessage) {
      throw new Error("No user message found");
    }

    // Generate embedding for the user query
    const queryEmbedding = await getEmbedding(latestUserMessage.content);

    // Adjust embedding dimensions to match Pinecone index (1024)
    let values = queryEmbedding;
    if (queryEmbedding.length > 1024) values = queryEmbedding.slice(0, 1024);
    if (queryEmbedding.length < 1024)
      values = [
        ...queryEmbedding,
        ...new Array(1024 - queryEmbedding.length).fill(0),
      ];

    // Query Pinecone for similar projects
    const index = pinecone.index("gitfund");
    const queryResponse = await index.query({
      vector: values, // Use the adjusted vector dimensions
      topK: 3,
      includeMetadata: true,
    });

    // Extract relevant context from the query results
    let context = "";
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      context = queryResponse.matches
        .map((match) => {
          const metadata = match.metadata as any;
          return `Project: ${metadata.projectName}\nOwner: ${
            metadata.owner
          }\nDescription: ${
            metadata.description
          }\nRelevance Score: ${match.score?.toFixed(4)}\n`;
        })
        .join("\n");
    }

    // Create an enhanced system message with the retrieved context
    const enhancedSystemMessage = `You are an assistant for GitFund, a platform that connects open-source projects with contributors.
        
Here is the ONLY information you should use to answer the query:
${context}

IMPORTANT INSTRUCTIONS:
1. ONLY use the information provided above to answer questions
2. If the information above doesn't contain the answer, say "I don't have information about that in my current context"
3. Do NOT use any knowledge outside of the provided context
4. Do NOT make up or infer information that isn't explicitly stated in the context
5. Keep your answers factual and directly tied to the project information provided`;

    // Stream the response with the enhanced context
    const result = streamText({
      model: google("models/gemini-2.0-flash"),
      system: enhancedSystemMessage,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in RAG processing:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Return a regular response with error information
    return NextResponse.json(
      {
        error: `Failed to process RAG request: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
