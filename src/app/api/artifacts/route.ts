import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createArtifactUploadUrl, isR2Enabled } from "@/lib/r2";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isR2Enabled()) {
    return NextResponse.json(
      {
        error: "Artifact storage is not configured",
        hint: "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET",
      },
      { status: 503 },
    );
  }

  let filename = "artifact.bin";
  try {
    const body = await request.json();
    if (typeof body?.filename === "string" && body.filename.trim()) {
      filename = body.filename.trim().replace(/[^\w.\-]+/g, "_");
    }
  } catch {
    // optional body
  }

  const key = `artifacts/${session.user.id}/${nanoid()}-${filename}`;
  const result = await createArtifactUploadUrl(key);
  if (!result) {
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json(result);
}
