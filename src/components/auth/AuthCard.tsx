import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-black">{title}</h1>
      {children}
    </div>
  );
}
