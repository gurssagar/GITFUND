import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { issues } from '../../../db/schema';


export async function GET(request:Request) {
    
    try {
        const projectsData = await db.select().from(issues).orderBy(issues.priority);
        return NextResponse.json({ projects: projectsData });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}