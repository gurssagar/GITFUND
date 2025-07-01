import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { contributorRequests } from '../../../db/schema';
import {eq} from "drizzle-orm";

export async function GET(request:Request) {
    try {
        const projectsData = await db.select().from(contributorRequests).where(eq(contributorRequests.status,"assigned"))
        return NextResponse.json({ projects: projectsData });
    } 
    catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}