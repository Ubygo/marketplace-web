import type { ReactNode } from "react";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
