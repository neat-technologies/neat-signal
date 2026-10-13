import { AuthResponse, makeAuthResponse } from "../server/auth";

// Client-side session handling. Consumes the server auth contract.
export class SessionClient {
  private current?: AuthResponse;

  login(user: string): string {
    const resp = makeAuthResponse(user);
    this.current = resp;
    return resp.token_id;
  }

  getToken(): string | undefined {
    return this.current?.token_id;
  }

  isValid(): boolean {
    return !!this.current && this.current.expires_at > Date.now();
  }

  authHeaders(): Record<string, string> {
    if (!this.current) return {};
    return { Authorization: `Bearer ${this.current.token_id}` };
  }
}
