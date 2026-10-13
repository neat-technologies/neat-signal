// server/auth.ts — the authoritative auth contract the client must match.
export interface AuthResponse {
  token_id: string;
  user_id: string;
  expires_at: number;
}

export function makeAuthResponse(userId: string): AuthResponse {
  return { token_id: randomId(), user_id: userId, expires_at: Date.now() + 3600_000 };
}

function randomId(): string {
  return Math.random().toString(36).slice(2);
}
