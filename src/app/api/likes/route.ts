import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { likes } from '../../../db/schema';
import { eq,and } from 'drizzle-orm';


export async function GET(request:Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const projectName = url.searchParams.get('projectName');

    if (!userId) {
        return NextResponse.json({ error: 'User is required' }, { status: 400 });
    }

    if( !projectName) {
        return NextResponse.json({ error: 'Project Name is required' }, { status: 400 });
    }

    try {
const projectsData = await db
  .select()
  .from(likes)
  .where(
    and(
      eq(likes.userId, userId),
      eq(likes.projectName, projectName)
    )
  )
  .orderBy(likes.likedAt);        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { userId, projectName } = body;

    console.log('DELETE like request body:', body);
    
    if (!userId || !projectName) {
        console.error('Missing required fields:', { userId, projectName });
        return NextResponse.json({
            error: 'User ID and Project Name are required',
            received: body
        }, { status: 400 });
    }

    try {
        const newLike = {
            userId,
            projectName,
        };

        await db.insert(likes).values(newLike);
        return NextResponse.json({ message: 'Project liked successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error liking project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { userId, projectName } = await request.json();

    if (!userId || !projectName) {
        return NextResponse.json({ error: 'User ID and Project Name are required' }, { status: 400 });
    }

    try {
        const result = await db
            .delete(likes)
            .where(
                and(
                    eq(likes.userId, userId),
                    eq(likes.projectName, projectName)
                )
            );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Like not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Like removed successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error removing like:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}