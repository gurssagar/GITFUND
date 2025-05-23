import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { project } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request:Request) {
    const url = new URL(request.url);
    const project_owner = url.searchParams.get('projectOwner');

    if (!project_owner) {
        return NextResponse.json({ error: 'projectOwner is required' }, { status: 400 });
    }

    try {

        const projectsData = await db.select().from(project).where(eq(project.projectOwner,project_owner));
        return NextResponse.json({ project: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}