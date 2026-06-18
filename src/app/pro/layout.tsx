import type { ReactNode } from "react";

export default function ProLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
