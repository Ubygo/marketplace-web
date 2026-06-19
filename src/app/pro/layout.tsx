import ProShell from "@/components/vendor/ProShell";
import type { ReactNode } from "react";

export default function ProLayout({ children }: { children: ReactNode }) {
  return <ProShell>{children}</ProShell>;
}
