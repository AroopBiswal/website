"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });

  return (
    <form className="admin-card admin-login" action={action}>
      <label className="admin-label" htmlFor="admin-password">
        Password
      </label>
      <input
        id="admin-password"
        className="admin-input"
        type="password"
        name="password"
        autoComplete="current-password"
        autoFocus
        required
      />
      {state.error && (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="sticker admin-sticker" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
