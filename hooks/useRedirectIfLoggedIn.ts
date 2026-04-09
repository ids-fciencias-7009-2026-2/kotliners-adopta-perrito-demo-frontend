"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/session";

export function useRedirectIfLoggedIn() {
  const router = useRouter();
  const isLoggedIn = Boolean(getToken());

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/home");
    }
  }, [isLoggedIn, router]);

  return false; 
}