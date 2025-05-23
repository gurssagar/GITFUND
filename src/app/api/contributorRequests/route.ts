import { contributorRequests } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { NextApiRequest,NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
export async function GET(request: NextApiRequest) {
    const url = new URL(request?.url);
    const project_owner = url.searchParams.get('projectOwner');

    if (!project_owner) {
        return NextResponse.json({ error: 'projectOwner is required' }, { status: 400 });
    }

    try {

        const projectsData = await db.select().from(contributorRequests).where(eq(contributorRequests.projectOwner, project_owner));
        return NextResponse.json({ project: projectsData });
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextApiRequest, response: NextApiResponse) {
    try {
        const {
            projectName,
            Contributor_id,
            contributor_email,
            requestDate,
            skills,
            issue,
            image_url,
            name,
            description,
            status,
        } = await request.body();

        // Check if required fields are present (optional but recommended)
        if (!projectName || !Contributor_id || !issue || !name) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields for assignment'
            }, { status: 400 });
        }

        await db.insert(contributorRequests).values({
            projectName: projectName,
            Contributor_id: Contributor_id,
            contributor_email: contributor_email,
            requestDate:requestDate,
            skills:skills,
            issue: issue,
            image_url: image_url,
            name: name,
            status: status,
            description: description
        })
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}