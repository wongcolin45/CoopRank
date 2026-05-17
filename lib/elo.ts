import { Role } from "./types";

export const K = 16;

export function roleKey(role: Role): string {
  return `${role.company}||${role.role}`;
}

export function seedElo(role: Role): number {
  return role.base_prestige_score * role.resume_signaling_multiplier;
}

export function buildSeed(roles: Role[]): Record<string, number> {
  const seed: Record<string, number> = {};
  roles.forEach((r) => {
    seed[roleKey(r)] = seedElo(r);
  });
  return seed;
}

function expected(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

export function applyVote(
  ratings: Record<string, number>,
  winner: Role,
  loser: Role
): Record<string, number> {
  const wk = roleKey(winner);
  const lk = roleKey(loser);
  const wr = ratings[wk] ?? seedElo(winner);
  const lr = ratings[lk] ?? seedElo(loser);
  const ea = expected(wr, lr);
  const eb = expected(lr, wr);
  return {
    ...ratings,
    [wk]: +(wr + K * (1 - ea)).toFixed(1),
    [lk]: +(lr + K * (0 - eb)).toFixed(1),
  };
}

export function pickPair(roles: Role[]): [Role, Role] | null {
  if (roles.length < 2) return null;
  const a = Math.floor(Math.random() * roles.length);
  let b;
  do {
    b = Math.floor(Math.random() * roles.length);
  } while (b === a);
  return [roles[a], roles[b]];
}
