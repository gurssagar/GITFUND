import { NextResponse } from "next/server";
import { db } from "../../../db/index";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { NEXT_BODY_SUFFIX } from "next/dist/lib/constants";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await db.select().from(users).where(eq(users?.id, username));
    console.log(user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const body = await request.json();
    const username = body.id;

    console.log(body);
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .update(users)
      .set({
        fullName: body.fullName || undefined,
        image_url: body.image_url || undefined,
        metaMask: body.metaMask || undefined,
        email: body.email || undefined,
        Location: body.location || undefined,
        Bio: body.bio || undefined,
        Telegram: body.telegram || undefined,
        Twitter: body.twitter || undefined,
        Linkedin: body.linkedin || undefined,
        rating: body.rating || undefined,
        skills: body.skills || undefined,
      })
      .where(eq(users.id, username));
    console.log("updated", updatedUser);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
