import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST() {
  try {
    const keys = await redis.keys("cooprank:*");
    if (keys.length > 0) await redis.del(...(keys as [string, ...string[]]));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
