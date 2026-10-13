import { AuthResponse, makeAuthResponse } from "../server/auth";

// Thrown when an operation requires an active session and there is none.
export class AuthError extends Error {
  constructor(message = "No active session") {
    super(message);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// Client-side session handling. Consumes the server auth contract.
export class SessionClient {
  private current?: AuthResponse;

  login(user: string): string {
    const resp = makeAuthResponse(user);
    this.current = resp;
    return resp.session_id;
  }

  getToken(): string | undefined {
    return this.current?.session_id;
  }

  isValid(): boolean {
    return !!this.current && this.current.expires_at > Date.now();
  }

  authHeaders(): Record<string, string> {
    if (!this.current) return {};
    return { Authorization: `Bearer ${this.current.session_id}` };
  }

  private requireSession(): AuthResponse {
    if (!this.current) throw new AuthError();
    return this.current;
  }

  // Re-issue the auth response for the current user and update stored state.
  refresh(): string {
    const { user_id } = this.requireSession();
    const resp = makeAuthResponse(user_id);
    this.current = resp;
    return resp.session_id;
  }

  logout(): void {
    this.current = undefined;
  }

  // If the session is expired, refresh once, then run fn.
  async retryIfExpired<T>(fn: () => T | Promise<T>): Promise<T> {
    this.requireSession();
    if (!this.isValid()) this.refresh();
    return fn();
  }

  describe(): string {
    const s = this.requireSession();
    return `session user=${s.user_id} token=${s.session_id} expires_at=${s.expires_at} valid=${this.isValid()}`;
  }
}
