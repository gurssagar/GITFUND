import { contributorRequests } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../../../db/index";

export async function GET(request: Request) {
  const url = new URL(request?.url);
  const project_owner = url.searchParams.get("projectOwner");

  if (!project_owner) {
    return NextResponse.json(
      { error: "projectOwner is required" },
      { status: 400 },
    );
  }

  try {
    const projectsData = await db
      .select()
      .from(contributorRequests)
      .where(eq(contributorRequests.projectOwner, project_owner));
    return NextResponse.json({ project: projectsData });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      projectName,
      Contributor_id,
      contributor_email,
      requestDate,
      skills,
      issue,
      projectOwner,
      image_url,
      name,
      description,
      status,
    } = await request.json();

    // Check if required fields are present (optional but recommended)
    if (!projectName || !Contributor_id || !issue || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields for assignment",
        },
        { status: 400 },
      );
    }

    await db.insert(contributorRequests).values({
      projectName: projectName,
      Contributor_id: Contributor_id,
      contributor_email: contributor_email,
      requestDate: requestDate,
      projectOwner: projectOwner,
      skills: skills,
      issue: issue,
      image_url: image_url,
      name: name,
      status: status,
      description: description,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error inserting contributor request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    // Check if required fields are present
    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id and status are required",
        },
        { status: 400 },
      );
    }

    // Update the status for the given id
    await db
      .update(contributorRequests)
      .set({ status: status })
      .where(eq(contributorRequests.id, id));

    return NextResponse.json(
      {
        success: true,
        message: "Status updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
