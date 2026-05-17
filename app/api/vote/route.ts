import { NextResponse } from "next/server";
import { redis, ratingsKey, votesKey } from "@/lib/redis";
import { applyVote, buildSeed, roleKey } from "@/lib/elo";
import rolesData from "../../../company_roles_scored.json";
import { Role } from "@/lib/types";

const roles = rolesData as unknown as Role[];

export async function POST(request: Request) {
  try {
    const { winnerKey, loserKey, trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json({ error: "trackId required" }, { status: 400 });
    }

    const winner = roles.find((r) => roleKey(r) === winnerKey);
    const loser = roles.find((r) => roleKey(r) === loserKey);

    if (!winner || !loser) {
      return NextResponse.json({ error: "Role not found" }, { status: 400 });
    }

    const stored = await redis.get<Record<string, number>>(ratingsKey(trackId));
    const ratings = stored ?? buildSeed(roles);

    const updated = applyVote(ratings, winner, loser);
    const votes = await redis.incr(votesKey(trackId));
    await redis.set(ratingsKey(trackId), updated);

    return NextResponse.json({ ratings: updated, votes });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
