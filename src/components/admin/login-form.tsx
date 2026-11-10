"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/admin";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div
          role="alert"
          className="rounded-xl border border-maroon/30 bg-maroon/8 px-4 py-3 text-sm text-maroon-deep"
        >
          {state.error}
        </div>
      )}

      <label className="block">
        <span className="label-caps text-ash">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          placeholder="admin@avrani.in"
          className="mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition focus:border-maroon focus:bg-ivory"
        />
      </label>

      <label className="block">
        <span className="label-caps text-ash">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="mt-2 w-full rounded-xl border border-sand bg-cream/50 px-4 py-3.5 outline-none transition focus:border-maroon focus:bg-ivory"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="label-caps w-full rounded-full bg-maroon px-8 py-4 text-ivory transition hover:bg-maroon-deep disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
