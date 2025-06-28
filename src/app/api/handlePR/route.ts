import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { PullRequest } from '../../../db/schema';
import { eq } from 'drizzle-orm';


export async function POST(request: Request) {
    try {
        const { id,
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
        await db.insert(PullRequest).values({
            id: id,
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
        const projectsData = await db.select().from(issues).where(eq(issues.project_repository, project_repository)).orderBy(issues.priority);
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}