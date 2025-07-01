import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { issues } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { and } from 'drizzle-orm';


export async function GET(request:Request) {
    const url = new URL(request.url);
    const project_repository = url.searchParams.get('project_repository');
    const issueNumber = url.searchParams.get('issueNumber');

    if (!project_repository) {
        return NextResponse.json({ error: 'project_repository is required' }, { status: 400 });
    }
    if (!issueNumber) {
        return NextResponse.json({ error: 'issueNumber is required' }, { status: 400 });
    }

    try {
        const projectsData = await db
        .select()
        .from(issues)
        .where(
            and(
            eq(issues.project_repository, project_repository),
            eq(issues.project_issues, issueNumber)
            )
        )
        .orderBy(issues.priority);
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}