import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
// Ensure both tables are imported if needed elsewhere, but GET uses assignedIssues
import { assignedIssues, assignIssues } from '../../../db/schema';


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

        // Check if required fields are present (optional but recommended)
        if (!projectName || !Contributor_id || !issue || !name) {
             return NextResponse.json({
                success: false,
                error: 'Missing required fields for assignment'
            }, { status: 400 });
        }

        await db.insert(assignedIssues).values({
            projectName,
            Contributor_id,
            issue,
            image_url: image_url || '', // Provide default if potentially null/undefined
            name,
            description: description || '' // Provide default if potentially null/undefined
        });

        // Optionally, you might want to DELETE the corresponding entry
        // from the assignIssues table here after successful insertion
        // await db.delete(assignIssues).where(...conditions...);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error assigning issue:', error);
        // Provide more specific error message if possible
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            success: false,
            error: `Failed to assign issue: ${errorMessage}`
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Corrected to select from the assignedIssues table
        const query = db.select().from(assignedIssues);

        const actuallyAssignedIssues = await query.execute();
        // Return under a more descriptive key, e.g., assignedIssues
        return NextResponse.json({ assignedIssues: actuallyAssignedIssues });
    } catch (error) {
        console.error('Error fetching assigned issues:', error);
         const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            error: `Failed to fetch assigned issues: ${errorMessage}`
        }, { status: 500 });
    }
}

