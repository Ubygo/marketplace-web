"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import CategoryIcon from "@/components/categories/CategoryIcon";
import VendorPendingApproval from "@/components/vendor/dashboard/VendorPendingApproval";
import VendorServiceCard from "@/components/vendor/services/VendorServiceCard";
import { TEXT_COLOR } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useTenantVendorMode } from "@/hooks/useTenantVendorMode";
import { useVendorApprovalGate } from "@/hooks/useVendorApprovalGate";
import { buildLoginUrl } from "@/lib/auth-url";
import { deleteService, fetchMyServices } from "@/lib/services-me-client";
import type { Service } from "@/types/service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function VendorServicesPage() {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();
  const { isPendingApproval } = useVendorApprovalGate();
  const { isPublicVendorSignup } = useTenantVendorMode();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/pro/prestations"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isVendorLoading && !hasVendor) {
      router.replace(isPublicVendorSignup ? "/devenir-prestataire" : "/");
    }
  }, [
    hasVendor,
    isAuthenticated,
    isAuthLoading,
    isPublicVendorSignup,
    isVendorLoading,
    router,
  ]);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyServices(slug, tenantId);
      setServices(data);
    } catch {
      setServices([]);
      toast.error("Impossible de charger vos prestations.");
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    if (!isAuthenticated || !hasVendor || isPendingApproval) return;
    void loadServices();
  }, [hasVendor, isAuthenticated, isPendingApproval, loadServices]);

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      await deleteService(slug, tenantId, deleteTargetId);
      setServices((prev) =>
        prev.filter((service) => service.id !== deleteTargetId),
      );
      toast.success("Prestation supprimée.");
    } catch {
      toast.error("Impossible de supprimer la prestation.");
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  }

  if (isAuthLoading || isVendorLoading || !isAuthenticated || !hasVendor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );
  }

  if (isPendingApproval) {
    return <VendorPendingApproval />;
  }

  return (
    <main className="mx-auto w-full py-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Prestations</h1>
          <p className="mt-1 text-sm text-black/60">
            Gérez les services que vous proposez à vos clients.
          </p>
        </div>
        <Link
          href="/pro/prestations/nouveau"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          <CategoryIcon icon="Ionicons/add" size={18} color="#fff" />
          Ajouter une prestation
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/3] animate-pulse rounded-2xl bg-black/5"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center">
          <CategoryIcon
            icon="Ionicons/briefcase-outline"
            size={32}
            color={TEXT_COLOR}
          />
          <p className="mt-3 text-sm text-black/60">
            Vous n&apos;avez pas encore de prestation.
          </p>
          <Link
            href="/pro/prestations/nouveau"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tenant-primary)]"
          >
            Créer ma première prestation
            <CategoryIcon
              icon="Ionicons/arrow-forward"
              size={16}
              color={TEXT_COLOR}
            />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <VendorServiceCard
              key={service.id}
              service={service}
              onDelete={setDeleteTargetId}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Supprimer cette prestation ?"
        description="Cette action est irréversible."
        confirmLabel={isDeleting ? "Suppression..." : "Supprimer"}
        cancelLabel="Annuler"
        destructive
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTargetId(null)}
      />
    </main>
  );
}
