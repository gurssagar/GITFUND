import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { PullRequests } from '../../../db/schema';
import { eq } from 'drizzle-orm';


export async function POST(request: Request) {
    try {
        const { 
          repository,
          pullRequestId,
          title,
          description,
          status,
          createdAt,
          rewardedAt,
          contributorId,
          projectName,
          rewardAmount,
          issue
        } = await request.json();

        // First insert the project
        await db.insert(PullRequests).values({
            repository: repository,
            pullRequestId: pullRequestId,
            title: title,
            description: description,
            status: status,
            createdAt: createdAt,
            rewardedAt: rewardedAt,
            contributorId: contributorId,
            projectName: projectName,
            rewardAmount: rewardAmount,
            issue: issue
        });

        // Optionally, you can return the created project data
        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
        console.error('Error in project creation:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request:Request) {
    const url = new URL(request.url);
    const project_repository = url.searchParams.get('project_repository');

    if (!project_repository) {
        return NextResponse.json({ error: 'project_repository is required' }, { status: 400 });
    }

    try {
        const projectsData = await db.select().from(PullRequests).where(eq(PullRequests.repository, project_repository));
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}