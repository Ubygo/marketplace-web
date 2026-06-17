import type { TenantBranding } from "@/lib/app-config";
import Image from "next/image";
import Link from "next/link";
import ContentContainer from "@/components/layout/ContentContainer";

interface AppHeaderProps {
  branding: TenantBranding;
  name: string;
}

export default function AppHeader({ branding, name }: AppHeaderProps) {
  const displayName = branding.displayName || name;
  const { logoUrl, primaryColor } = branding;

  return (
    <header className="py-4">
      <ContentContainer className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={displayName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : null}
          <span className="text-lg font-bold text-black">{displayName}</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Connexion
        </Link>
      </ContentContainer>
    </header>
  );
}
