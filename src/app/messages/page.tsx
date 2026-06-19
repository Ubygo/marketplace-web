import MessagesPage from "@/components/messages/MessagesPage";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { privatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ conversation?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  return privatePageMetadata("Messages", config);
}

export default async function MessagesRoutePage({ searchParams }: PageProps) {
  const { conversation } = await searchParams;

  return (
    <Suspense fallback={null}>
      <MessagesPage
        mode="customer"
        initialConversationId={conversation ?? null}
      />
    </Suspense>
  );
}
