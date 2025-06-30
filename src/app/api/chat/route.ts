import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db/index";
import { messages } from "../../../db/schema";
import { eq, and, or } from "drizzle-orm";

interface MessageData {
  from: string;
  text: string;
  timestamp: string;
  to: string;
}

export async function POST(req: NextRequest) {
  const { from, text, timestamp, to } = await req.json();
  console.log("Received message:", { from, text, timestamp, to });
  try {
    const parsedTimestamp = new Date(timestamp);
    const result = await db.insert(messages).values({
      sender_id: from,
      reciever_id: to,
      timestamp: parsedTimestamp,
      text: text,
    });
    return NextResponse.json({ data: "Success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const username = searchParams.get("username");

  try {
    let messageData;
    if (username) {
      messageData = await db
        .select()
        .from(messages)
        .where(or(eq(messages.sender_id, username)))
        .orderBy(messages.timestamp);
    } else {
      messageData = await db
        .select()
        .from(messages)
        .orderBy(messages.timestamp);
    }
    return NextResponse.json({ projects: messageData });
  } catch (error) {
    console.error("Error:", error);
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
