import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { assignedIssues } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { 
            projectName, 
            Contributor_id, 
            issue,
            image_url,
            name,
            description,
            projectOwner
        } = await request.json();
        
        await db.insert(assignedIssues).values({
            projectName,
            Contributor_id,
            issue,
            image_url,
            name,
            description,
            projectOwner
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error assigning issue:', error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to assign issue'
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectOwner = searchParams.get('projectOwner');
        
        if (!projectOwner) {
            return NextResponse.json(
                { error: 'projectOwner parameter is required' },
                { status: 400 }
            );
        }

        const query = db.selectDistinct({ Contributor: assignedIssues.Contributor_id })
            .from(assignedIssues)
            .where(eq(assignedIssues.projectOwner, projectOwner));

        const assignments = await query.execute();
        return NextResponse.json({ assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
}