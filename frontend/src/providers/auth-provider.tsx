"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
