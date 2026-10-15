import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./auth";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return { isAuth: true, user: session };
});

export const getUser = cache(async () => {
  const session = await getSession();
  return session;
});
