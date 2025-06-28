import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { PullRequests } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request:Request) {
    const url = new URL(request.url);
    const contributor = url.searchParams.get('contributor');

    if (!contributor) {
        return NextResponse.json({ error: 'contributor is required' }, { status: 400 });
    }

    try {
        const projectsData = await db.select().from(PullRequests).where(eq(PullRequests.contributorId, contributor)).orderBy(PullRequests.rewardedAt);
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}