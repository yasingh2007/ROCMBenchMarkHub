import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = await getDb();
  const rows = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!rows[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(submissions)
    .set({ flagged: true })
    .where(eq(submissions.id, id));

  return NextResponse.json({ ok: true, flagged: true });
}
