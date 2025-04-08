import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { projects } from '../../../db/schema';

export async function POST(request: Request) {
    try {
        const { projectName,rewardAmount,contributors, aiDescription, projectOwner, shortdes, longdis, image_url , project_repository, project_issues } = await request.json();
    
        await db.insert(projects).values({
            contributors:contributors,
            aiDescription:aiDescription,
            projectOwner:projectOwner,
            projectName: projectName,
            shortdes: shortdes,
            longdis: longdis,
            image_url: image_url,
            project_repository: project_repository,
            project_issues:project_issues,
            rewardAmount:rewardAmount,
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error inserting user:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function GET() {
    try {
        const projectsData = await db.select().from(projects);
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}



