import { getTenantFromHeaders } from "@/lib/tenant";

export default async function Home() {
  const tenant = (await getTenantFromHeaders()) ?? "inconnu";

  return (
    <main className="flex min-h-full flex-1 items-center justify-center">
      <p className="text-lg">Tenant actuel : {tenant}</p>
    </main>
  );
}
