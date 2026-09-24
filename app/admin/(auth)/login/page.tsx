import type { Metadata } from "next";

import { authDriver } from "@/lib/auth/session";
import { publicEnv } from "@/lib/config/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const { next } = await props.searchParams;
  return (
    <>
      <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.03em]">Sign in to the admin</h1>
      <p className="mt-1.5 text-[14px] text-fg-2">For the VibeGen team only.</p>
      <LoginForm next={typeof next === "string" ? next : ""} canRecover={authDriver === "database"} demoHint={authDriver === "local" && publicEnv.demoMode} />
    </>
  );
}
