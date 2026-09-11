"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, startSession } from "@/lib/admin-auth";

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    // A wrong guess costs a moment. Not a rate limit, but it makes a brute
    // force through this form slow enough to be pointless.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "That is not the password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin");
}
