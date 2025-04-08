import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { assignIssues } from '../../../db/schema';


export async function POST(request: Request) {
    try {
        const { 
            projectName, 
            Contributor_id, 
            issue,
            image_url,
            name,
            description 
        } = await request.json();
        
        await db.insert(assignIssues).values({
            projectName,
            Contributor_id,
            issue,
            image_url,
            name,
            description
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

export async function GET() {
    try {

        const query = db.select().from(assignIssues);
        

        const assignments = await query.execute();
        return NextResponse.json({ assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch assignments' 
        }, { status: 500 });
    }
}