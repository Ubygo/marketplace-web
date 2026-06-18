"use client";

import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/header/AppHeader";
import ContentContainer from "@/components/layout/ContentContainer";
import SearchResults from "@/components/search/SearchResults";
import { TenantStripeProvider } from "@/components/providers/StripeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { VendorProvider } from "@/contexts/VendorContext";
import { UnreadMessagesProvider } from "@/contexts/UnreadMessagesContext";
import type { TenantBranding, TenantFeatures } from "@/lib/app-config";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

interface TenantShellProps {
  tenantId: string;
  slug: string;
  branding: TenantBranding;
  name: string;
  currency?: string;
  features?: TenantFeatures | null;
  payoutMode?: string | null;
  escrowEnabled?: boolean;
  stripePublishableKey?: string | null;
  mapboxPublicToken?: string | null;
  privacyPolicyUrl?: string | null;
  cgvUrl?: string | null;
  supportEmail?: string | null;
  children: ReactNode;
}

function SearchAwareContent({ children }: { children: ReactNode }) {
  const { hasActiveSearch } = useSearch();

  if (hasActiveSearch) {
    return <SearchResults />;
  }

  return children;
}

export default function TenantShell({
  tenantId,
  slug,
  branding,
  name,
  currency = "EUR",
  features = null,
  payoutMode = null,
  escrowEnabled = false,
  stripePublishableKey = null,
  mapboxPublicToken = null,
  privacyPolicyUrl,
  cgvUrl,
  supportEmail,
  children,
}: TenantShellProps) {
  return (
    <TenantProvider
      tenantId={tenantId}
      slug={slug}
      tenantName={name}
      primaryColor={branding.primaryColor}
      currency={currency}
      features={features}
      payoutMode={payoutMode}
      escrowEnabled={escrowEnabled}
      stripePublishableKey={stripePublishableKey}
      mapboxPublicToken={mapboxPublicToken}
      privacyPolicyUrl={privacyPolicyUrl}
      cgvUrl={cgvUrl}
      supportEmail={supportEmail}
    >
      <TenantStripeProvider publishableKey={stripePublishableKey}>
        <AuthProvider tenantId={tenantId} slug={slug}>
          <VendorProvider>
            <FavoritesProvider>
              <UnreadMessagesProvider>
                <SearchProvider tenantId={tenantId}>
                  <AppHeader branding={branding} name={name} />
                  <ContentContainer className="flex min-h-full flex-1 flex-col">
                    <SearchAwareContent>{children}</SearchAwareContent>
                  </ContentContainer>
                  <AppFooter branding={branding} name={name} />
                  <Toaster position="top-center" richColors closeButton />
                </SearchProvider>
              </UnreadMessagesProvider>
            </FavoritesProvider>
          </VendorProvider>
        </AuthProvider>
      </TenantStripeProvider>
    </TenantProvider>
  );
}
