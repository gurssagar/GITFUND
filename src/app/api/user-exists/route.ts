import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { compare } = await request.json();

        if (!compare) {
            return NextResponse.json({ error: 'Missing compare parameter' }, { status: 400 });
        }

        const usersData = await db.select().from(users).where(eq(users.id, compare));
        return NextResponse.json({ users: usersData });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}