import { NextResponse } from 'next/server';
import { db } from '../../../db/index';
import { users } from '../../../db/schema';

export async function POST(request: Request) {
    try {
        const { id, email, name, walletAddress } = await request.json();
        
        await db.insert(users).values({
            id: id,
            email: email,
            fullName: name,
            metaMask: walletAddress,
        });

        

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error inserting user:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function GET() {
    try {
        const usersData = await db.select().from(users);
        return NextResponse.json({ users: usersData });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

