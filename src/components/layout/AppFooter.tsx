"use client";

import ContentContainer from "@/components/layout/ContentContainer";
import { APP_BACKGROUND_COLOR } from "@/constants/theme";
import { UBYGO_HOME_URL } from "@/constants/urls";
import { useTenant } from "@/contexts/TenantContext";
import type { TenantBranding } from "@/lib/app-config";

interface AppFooterProps {
  branding: TenantBranding;
  name: string;
}

export default function AppFooter({ branding, name }: AppFooterProps) {
  const { privacyPolicyUrl, cgvUrl } = useTenant();
  const displayName = branding.displayName || name;
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto text-black"
      style={{ backgroundColor: APP_BACKGROUND_COLOR }}
    >
      <ContentContainer className="flex flex-col gap-4 py-8 md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-base font-bold text-black">{displayName}</p>
          <p className="text-sm text-black">
            © {currentYear} {displayName}
          </p>
        </div>

        <div className="flex flex-col gap-3 text-right text-sm text-black md:ml-auto">
          {(privacyPolicyUrl || cgvUrl) && (
            <nav aria-label="Liens légaux" className="flex flex-col gap-2">
              {cgvUrl ? (
                <a
                  href={cgvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black transition-opacity hover:opacity-70"
                >
                  Conditions générales d&apos;utilisation
                </a>
              ) : null}
              {privacyPolicyUrl ? (
                <a
                  href={privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black transition-opacity hover:opacity-70"
                >
                  Politique de confidentialité
                </a>
              ) : null}
            </nav>
          )}

          <p className="text-black">
            Provided by{" "}
            <a
              href={UBYGO_HOME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              ubygo.com
            </a>
          </p>
        </div>
      </ContentContainer>
    </footer>
  );
}
