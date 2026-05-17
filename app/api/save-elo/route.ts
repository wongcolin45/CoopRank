import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const ratings = await request.json();

    if (typeof ratings !== "object" || Array.isArray(ratings)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      path.join(dir, "elo_ratings.json"),
      JSON.stringify(ratings, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
