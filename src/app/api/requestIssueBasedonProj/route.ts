import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { assignIssues } from '../../../db/schema';
import { eq ,and} from 'drizzle-orm';
// ... existing code ...

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const issue_number = searchParams.get('issueNumber');
    const result = await db
        .select()
        .from(assignIssues)
        .where(
            and(
            eq(assignIssues.projectName, String(repo)),
            eq(assignIssues.issue, String(issue_number))
            )
    );
    console.log(result);
    // You can now use owner, repo, and issue_number in your logic
    // Example response:
    return NextResponse.json({
        owner,
        repo,
        issue_number,
        result
    });
}

// ... existing code ....}