import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { Rewards } from '../../../db/schema';
import { and, desc, eq, like } from 'drizzle-orm';
import { InferModel } from 'drizzle-orm';

type Reward = InferModel<typeof Rewards, 'select'>;
type NewReward = InferModel<typeof Rewards, 'insert'>;

interface RewardInput {
  projectName: string;
  Contributor_id: string;
  issue: string;
  value: number | string;
  date: string;
}

// Reusable error response
function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * POST handler for creating reward entries
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as RewardInput;
    const { projectName, Contributor_id, issue, value, date } = body;

    if (!projectName || !Contributor_id || !issue || value === undefined || value === null || !date) {
      return errorResponse('Missing required fields for reward entry (projectName, Contributor_id, issue, value, date)');
    }

    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue < 0) {
      return errorResponse('Invalid input: value must be a positive number.');
    }

    const dateValue = new Date(date);
    if (isNaN(dateValue.getTime())) {
      return errorResponse('Invalid date format.');
    }

    await db.insert(Rewards).values({
      projectName,
      Contributor_id,
      issue,
      value: String(numericValue),
      date
    });

    return NextResponse.json({
      success: true,
      message: 'Reward created successfully'
    });

  } catch (error) {
    console.error('Error creating reward entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(`Failed to create reward entry: ${errorMessage}`, 500);
  }
}

/**
 * GET handler for fetching reward entries with filtering and pagination
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return errorResponse('Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100.');
    }

    const contributor = searchParams.get('contributor');
    const project = searchParams.get('project');

    const filters = [];
    if (contributor) filters.push(like(Rewards.Contributor_id, `%${contributor}%`));
    if (project) filters.push(like(Rewards.projectName, `%${project}%`));

    const offset = (page - 1) * limit;

    const rewards: Reward[] = await db.select()
      .from(Rewards)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(Rewards.date))
      .limit(limit)
      .offset(offset)
      .execute();

    const allRewards: Reward[] = await db.select()
      .from(Rewards)
      .where(filters.length ? and(...filters) : undefined)
      .execute();

    const totalCount = allRewards.length;

    return NextResponse.json({
      success: true,
      Rewards: rewards,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching reward entries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(`Failed to fetch reward entries: ${errorMessage}`, 500);
  }
}

/**
 * DELETE handler for removing a reward entry
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');
    const contributor = searchParams.get('contributor');
    const issue = searchParams.get('issue');

    if (!projectName || !contributor || !issue) {
      return errorResponse('Missing required parameters (projectName, contributor, issue)');
    }

    const result = await db.delete(Rewards)
      .where(and(
        eq(Rewards.projectName, projectName),
        eq(Rewards.Contributor_id, contributor),
        eq(Rewards.issue, issue)
      ))
      .execute();

    if (!result || result.length === 0) {
      return errorResponse('Reward entry not found', 404);
    }

    return NextResponse.json({
      success: true,
      message: 'Reward entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting reward entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(`Failed to delete reward entry: ${errorMessage}`, 500);
  }
}

/**
 * PATCH handler for updating a reward entry
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as Partial<NewReward> & {
      projectName?: string;
      Contributor_id?: string;
      issue?: string;
    };

    const { projectName, Contributor_id, issue, value, date } = body;

    if (!projectName || !Contributor_id || !issue) {
      return errorResponse('Missing required fields for identification (projectName, Contributor_id, issue)');
    }

    const updateData: Partial<NewReward> = {};

    if (value !== undefined) {
      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < 0) {
        return errorResponse('Invalid input: value must be a positive number.');
      }
      updateData.value = String(numericValue);
    }

    if (date !== undefined && date !== null && date !== '') {
      const dateValue = new Date(date);
      if (isNaN(dateValue.getTime())) {
        return errorResponse('Invalid date format.');
      }
      updateData.date = date;
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields provided for update');
    }

    await db.update(Rewards)
      .set(updateData)
      .where(and(
        eq(Rewards.projectName, projectName),
        eq(Rewards.Contributor_id, Contributor_id),
        eq(Rewards.issue, issue)
      ))
      .execute();

    return NextResponse.json({
      success: true,
      message: 'Reward entry updated successfully'
    });

  } catch (error) {
    console.error('Error updating reward entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(`Failed to update reward entry: ${errorMessage}`, 500);
  }
}
