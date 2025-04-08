import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = cookies();
    const sessionToken = async() => (await (cookieStore)).get('authjs.session-token');
    return NextResponse.json({ exists: !!sessionToken });
}