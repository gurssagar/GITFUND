import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
// Assuming 'assignIssues' is the correct table for storing reward info for now.
// Consider creating a dedicated 'rewards' table if appropriate.
import { assignIssues } from '../../../db/schema';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            projectName,
            Contributor, // Ensure this matches the schema column name (e.g., 'Contributor' or 'contributor')
            issue,
            value,
            date,
        } = body;

        // --- Input Validation ---
        if (!projectName || !Contributor || !issue || value === undefined || value === null || !date) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields for reward entry (projectName, Contributor, issue, value, date)'
            }, { status: 400 });
        }

        const numericValue = Number(value);
        if (isNaN(numericValue)) {
             return NextResponse.json({
                success: false,
                error: 'Invalid input: value must be a number.'
            }, { status: 400 });
        }
        // Optional: Add date validation if needed

        // --- Database Insertion ---
        // Ensure the keys here exactly match the column names in your assignIssues schema
        await db.insert(assignIssues).values({
            projectName,
            Contributor, // Use the correct schema column name if different
            issue,
            value: numericValue, // Use the validated numeric value
            date // Ensure the date format is compatible with your DB column type
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating reward entry:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            success: false,
            error: `Failed to create reward entry: ${errorMessage}`
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Consider adding filtering (e.g., by Contributor, projectName) and pagination for large datasets
        const query = db.select().from(assignIssues);

        const results = await query.execute();
        // Return results under a key that matches the endpoint's purpose
        return NextResponse.json({ rewards: results });
    } catch (error) {
        console.error('Error fetching reward entries:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            error: `Failed to fetch reward entries: ${errorMessage}`
        }, { status: 500 });
    }
}