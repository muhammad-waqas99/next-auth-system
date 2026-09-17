import LoginChallenge from "@/app/models/loginChallenge.model";
import {
  generateLoginChallenge,
  hashLoginChallenge,
} from "@/app/lib/auth/token/token";

export async function createLoginChallenge(userId: string) {
  const loginChallenge = generateLoginChallenge();
  const challengeHash = hashLoginChallenge(loginChallenge);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await LoginChallenge.create({
    userId,
    challengeHash,
    expiresAt,
  });

  return loginChallenge;
}