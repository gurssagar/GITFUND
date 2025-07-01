import { NextResponse,NextRequest } from 'next/server';
import { db } from '../../../db/index';
import { issues } from '../../../db/schema';
import {eq} from "drizzle-orm";
export async function GET(request:Request) {
    try {
        const { searchParams } = new URL(request.url);
        const publisher = searchParams.get('publisher');
        

        const projectsData = await db.select().from(issues).where(eq(issues.publisher,publisher as string))
        return NextResponse.json({ projects: projectsData });
    } 
    catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}