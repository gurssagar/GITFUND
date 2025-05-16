import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { Rewards } from '../../../db/schema';
import { desc, eq, like } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST handler for creating reward entries
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            projectName,
            Contributor_id, // Match the schema column name
            issue,
            value,
            date,
        } = body;

        // Input Validation
        if (!projectName || !Contributor_id || !issue || value === undefined || value === null || !date) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields for reward entry (projectName, Contributor_id, issue, value, date)'
            }, { status: 400 });
        }

        // Validate value is a proper number
        const numericValue = Number(value);
        if (isNaN(numericValue) || numericValue < 0) {
            return NextResponse.json({
                success: false,
                error: 'Invalid input: value must be a positive number.'
            }, { status: 400 });
        }

        // Date validation
        const dateValue = new Date(date);
        if (isNaN(dateValue.getTime())) {
            return NextResponse.json({
                success: false,
                error: 'Invalid date format.'
            }, { status: 400 });
        }

        // Database Insertion - ensure column names match schema
        await db.insert(Rewards).values({
            projectName,
            Contributor_id, // Correct schema column name
            issue,
            value: String(numericValue), // Convert to string as per schema
            date: date // We're storing as a string in the schema
        });

        return NextResponse.json({ 
            success: true,
            message: 'Reward created successfully'
        });
    } catch (error) {
        console.error('Error creating reward entry:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            success: false,
            error: `Failed to create reward entry: ${errorMessage}`
        }, { status: 500 });
    }
}

/**
 * GET handler for fetching reward entries with filtering and pagination
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        // Validate pagination parameters
        if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
            return NextResponse.json({
                success: false,
                error: 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100.'
            }, { status: 400 });
        }
        
        // Filter parameters
        const contributor = searchParams.get('contributor');
        const project = searchParams.get('project');
        
        // Build query with optional filters
        let query = db.select().from(Rewards);
        
        if (contributor) {
            query = query.where(like(Rewards.Contributor_id, `%${contributor}%`));
        }
        
        if (project) {
            query = query.where(like(Rewards.projectName, `%${project}%`));
        }
        
        // Apply ordering
        query = query.orderBy(desc(Rewards.date));
        
        // Apply pagination
        const offset = (page - 1) * limit;
        query = query.limit(limit).offset(offset);
        
        // Execute query
        const results = await query.execute();
        
        // Get total count for pagination info (without pagination constraints)
        let countQuery = db.select().from(Rewards);
        if (contributor) {
            countQuery = countQuery.where(like(Rewards.Contributor_id, `%${contributor}%`));
        }
        if (project) {
            countQuery = countQuery.where(like(Rewards.projectName, `%${project}%`));
        }
        const allResults = await countQuery.execute();
        const totalCount = allResults.length;
        
        return NextResponse.json({
            success: true,
            Rewards: results,
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
        return NextResponse.json({
            success: false,
            error: `Failed to fetch reward entries: ${errorMessage}`
        }, { status: 500 });
    }
}

/**
 * DELETE handler for removing a reward entry
 */
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectName = searchParams.get('projectName');
        const contributor = searchParams.get('contributor');
        const issue = searchParams.get('issue');
        
        if (!projectName || !contributor || !issue) {
            return NextResponse.json({
                success: false,
                error: 'Missing required parameters (projectName, contributor, issue)'
            }, { status: 400 });
        }
        
        // Delete the reward entry matching all criteria
        const result = await db.delete(Rewards)
            .where(eq(Rewards.projectName, projectName))
            .where(eq(Rewards.Contributor_id, contributor))
            .where(eq(Rewards.issue, issue))
            .execute();
            
        if (!result) {
            return NextResponse.json({
                success: false,
                error: 'Reward entry not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Reward entry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting reward entry:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            success: false,
            error: `Failed to delete reward entry: ${errorMessage}`
        }, { status: 500 });
    }
}

/**
 * PATCH handler for updating a reward entry
 */
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const {
            projectName,
            Contributor_id,
            issue,
            value,
            date
        } = body;
        
        // Validate required fields for identification
        if (!projectName || !Contributor_id || !issue) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields for identification (projectName, Contributor_id, issue)'
            }, { status: 400 });
        }
        
        // Create an update object with only the provided fields
        const updateData: Record<string, any> = {};
        
        if (value !== undefined) {
            const numericValue = Number(value);
            if (isNaN(numericValue) || numericValue < 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid input: value must be a positive number.'
                }, { status: 400 });
            }
            updateData.value = String(numericValue);
        }
        
        if (date !== undefined) {
            const dateValue = new Date(date);
            if (isNaN(dateValue.getTime())) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid date format.'
                }, { status: 400 });
            }
            updateData.date = date;
        }
        
        // Only proceed with update if there are fields to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No fields provided for update'
            }, { status: 400 });
        }
        
        // Update the reward entry
        await db.update(Rewards)
            .set(updateData)
            .where(eq(Rewards.projectName, projectName))
            .where(eq(Rewards.Contributor_id, Contributor_id))
            .where(eq(Rewards.issue, issue))
            .execute();
        
        return NextResponse.json({ 
            success: true,
            message: 'Reward entry updated successfully'
        });
    } catch (error) {
        console.error('Error updating reward entry:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({
            success: false,
            error: `Failed to update reward entry: ${errorMessage}`
        }, { status: 500 });
    }
}