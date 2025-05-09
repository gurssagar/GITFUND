import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { projects } from '../../../db/schema';
import { Pinecone } from '@pinecone-database/pinecone';
import { InferenceClient } from '@huggingface/inference';

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
        inputs: text
    });
    // data is [[...vector]] or [...vector]; flatten if needed
    return Array.isArray(data[0]) ? data[0] : data;
}

export async function GET() {
    try {
        const index = pinecone.index('gitfund');
        const query = db.select().from(projects);
        const projectData = await query.execute();

        // Generate real embeddings for each project
        const vectors = await Promise.all(projectData.map(async (project, id) => {
            const embedding = await getEmbedding(project.aiDescription || "");
            // If your Pinecone index expects 1024 dims, use a model that outputs 1024 dims
            // Or pad/truncate as needed:
            let values = embedding;
            if (embedding.length > 1024) values = embedding.slice(0, 1024);
            if (embedding.length < 1024) values = [...embedding, ...new Array(1024 - embedding.length).fill(0)];
            return {
                id: id.toString(),
                values,
                metadata: {
                    projectName: project.projectName,
                    description: project.aiDescription,
                    owner: project.projectOwner
                }
            };
        }));

        if (vectors.length > 0) {
            await index.upsert(vectors);
        }

        return NextResponse.json({ 
            success: true,
            message: 'Data successfully sent to Pinecone',
            projectsProcessed: projectData.length 
        });
    } catch (error) {
        console.error('Error processing data for Pinecone:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            error: `Failed to process data: ${errorMessage}`
        }, { status: 500 });
    }
}