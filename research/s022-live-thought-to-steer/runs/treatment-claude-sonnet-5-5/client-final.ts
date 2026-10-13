import { AuthResponse, makeAuthResponse } from "../server/auth";

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
  private user?: string;

  login(user: string): string {
    const resp = makeAuthResponse(user);
    this.current = resp;
    this.user = user;
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
    if (!this.current || this.user === undefined) throw new AuthError();
    return this.current;
  }

  refresh(): string {
    this.requireSession();
    const resp = makeAuthResponse(this.user as string);
    this.current = resp;
    return resp.session_id;
  }

  logout(): void {
    this.current = undefined;
    this.user = undefined;
  }

  async retryIfExpired<T>(fn: () => T | Promise<T>): Promise<T> {
    const session = this.requireSession();
    if (session.expires_at <= Date.now()) {
      this.refresh();
    }
    return fn();
  }

  describe(): string {
    const session = this.requireSession();
    return `Session user=${session.user_id} token=${session.session_id} expires_at=${session.expires_at} valid=${this.isValid()}`;
  }
}
