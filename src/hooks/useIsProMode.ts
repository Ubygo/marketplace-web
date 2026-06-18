"use client";

import { usePathname } from "next/navigation";

export function useIsProMode(): boolean {
  const pathname = usePathname();
  return pathname === "/pro" || pathname.startsWith("/pro/");
}
