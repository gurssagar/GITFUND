import { contributorRequests } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../../../db/index";

export async function GET(request: Request) {
  const url = new URL(request?.url);
  const contributor = url.searchParams.get("contributor");

  if (!contributor) {
    return NextResponse.json(
      { error: "contributor is required" },
      { status: 400 },
    );
  }

  try {
    const projectsData = await db
      .select()
      .from(contributorRequests)
      .where(eq(contributorRequests.Contributor_id, contributor));
    return NextResponse.json({ project: projectsData });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
