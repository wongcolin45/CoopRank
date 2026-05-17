import rolesData from "../company_roles_scored.json";
import companyColors from "../data/company_colors.json";
import RankingApp from "../components/RankingApp";
import { Role } from "../lib/types";
import { redis, TRACK_IDS, ratingsKey, votesKey } from "../lib/redis";

export default async function Home() {
  const allRatings: Record<string, Record<string, number>> = {};
  const allVoteCounts: Record<string, number> = {};

  try {
    const results = await Promise.all(
      TRACK_IDS.map(async (trackId) => {
        const [ratings, votes] = await Promise.all([
          redis.get<Record<string, number>>(ratingsKey(trackId)),
          redis.get<number>(votesKey(trackId)),
        ]);
        return { trackId, ratings: ratings ?? {}, votes: votes ?? 0 };
      })
    );
    results.forEach(({ trackId, ratings, votes }) => {
      allRatings[trackId] = ratings;
      allVoteCounts[trackId] = votes;
    });
  } catch {}

  const roles = (rolesData as unknown as Role[]).map((role) => ({
    ...role,
    company_color:
      companyColors[role.company as keyof typeof companyColors] ??
      role.company_color,
  }));

  return (
    <RankingApp
      roles={roles}
      initialRatings={allRatings}
      initialVoteCounts={allVoteCounts}
      canReset={process.env.NODE_ENV === "development"}
    />
  );
}
