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
    return resp.token_id;
  }

  private requireSession(): AuthResponse {
    if (!this.current) throw new AuthError();
    return this.current;
  }

  refresh(): string {
    const session = this.requireSession();
    const resp = makeAuthResponse(session.user_id);
    this.current = resp;
    return resp.token_id;
  }

  logout(): void {
    this.current = undefined;
  }

  async retryIfExpired<T>(fn: () => T | Promise<T>): Promise<T> {
    this.requireSession();
    if (!this.isValid()) {
      this.refresh();
    }
    return await fn();
  }

  describe(): string {
    const session = this.requireSession();
    return `Session(user=${session.user_id}, token=${session.token_id}, expires_at=${session.expires_at})`;
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
