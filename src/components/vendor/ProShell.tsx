"use client";

import ProTabBar from "@/components/vendor/ProTabBar";
import type { ReactNode } from "react";

interface ProShellProps {
  children: ReactNode;
}

export default function ProShell({ children }: ProShellProps) {
  return (
    <>
      <div className="pb-20 md:pb-0">{children}</div>
      <ProTabBar />
    </>
  );
}
