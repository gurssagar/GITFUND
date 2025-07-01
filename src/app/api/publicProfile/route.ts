import { NextResponse } from "next/server";
import { db } from "../../../db/index";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try{
        const url = new URL(request.url);
        const username = url.searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        const user = await db.select().from(users).where(eq(users?.id, username));

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    }
    catch{
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
