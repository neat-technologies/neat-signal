import { AuthResponse, makeAuthResponse } from "../server/auth";

// Thrown when an operation requires an active session but none exists.
export class AuthError extends Error {
  readonly code = "NO_ACTIVE_SESSION" as const;

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

  isExpired(): boolean {
    return !!this.current && this.current.expires_at <= Date.now();
  }

  authHeaders(): Record<string, string> {
    if (!this.current) return {};
    return { Authorization: `Bearer ${this.current.session_id}` };
  }

  // Re-issues the auth response for the current user and replaces stored state.
  refresh(): string {
    const session = this.requireSession();
    const resp = makeAuthResponse(session.user_id);
    this.current = resp;
    return resp.session_id;
  }

  logout(): void {
    this.current = undefined;
  }

  // Refreshes once if the session has expired, then runs fn.
  async retryIfExpired<T>(fn: () => T | Promise<T>): Promise<T> {
    this.requireSession();
    if (this.isExpired()) {
      this.refresh();
    }
    return fn();
  }

  describe(): string {
    if (!this.current) return "SessionClient(no active session)";
    const { session_id, user_id, expires_at } = this.current;
    const state = this.isValid() ? "valid" : "expired";
    return `SessionClient(user=${user_id}, token=${session_id}, expires_at=${new Date(expires_at).toISOString()}, ${state})`;
  }

  private requireSession(): AuthResponse {
    if (!this.current) throw new AuthError();
    return this.current;
  }
}
