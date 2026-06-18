"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { useTenant } from "@/contexts/TenantContext";
import { fetchVendorStats } from "@/lib/vendors-me-client";
import type { VendorStatsPeriod } from "@/types/vendor";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface VendorStatsSectionProps {
  vendorId: string;
  primaryColor: string;
}

type StatsPeriod = "today" | "last7days" | "last30days" | "custom";

const PERIOD_LABELS: Record<StatsPeriod, string> = {
  today: "Aujourd'hui",
  last7days: "7 jours",
  last30days: "30 jours",
  custom: "Personnalisé",
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toStartOfDayIso(date: Date): string {
  return startOfDay(date).toISOString();
}

function toEndOfDayIso(date: Date): string {
  const end = startOfDay(date);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function VendorStatsSection({
  vendorId,
  primaryColor,
}: VendorStatsSectionProps) {
  const { slug, tenantId, currency } = useTenant();
  const [period, setPeriod] = useState<StatsPeriod>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    orderCount: 0,
    revenue: 0,
    currency,
  });

  const todayIso = useMemo(() => {
    const today = startOfDay(new Date());
    return today.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (period === "custom" && (!customStart || !customEnd)) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadStats() {
      try {
        setIsLoading(true);
        const params =
          period === "custom"
            ? {
                period: "custom" as const,
                startDate: toStartOfDayIso(new Date(customStart)),
                endDate: toEndOfDayIso(new Date(customEnd)),
              }
            : {
                period: period as Exclude<VendorStatsPeriod, "custom">,
              };

        const data = await fetchVendorStats(slug, tenantId, vendorId, params);

        if (!isMounted) return;
        setStats({
          orderCount: data.orderCount,
          revenue: data.revenue,
          currency: data.currency ?? currency,
        });
      } catch {
        if (!isMounted) return;
        setStats({ orderCount: 0, revenue: 0, currency });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, [slug, tenantId, vendorId, period, customStart, customEnd]);

  return (
    <div
      className="rounded-2xl p-5 text-white"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PERIOD_LABELS) as StatsPeriod[]).map((periodValue) => (
          <button
            key={periodValue}
            type="button"
            onClick={() => setPeriod(periodValue)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              period === periodValue
                ? "bg-white text-black"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {PERIOD_LABELS[periodValue]}
          </button>
        ))}
      </div>

      {period === "custom" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-white/90">
            Date de début
            <input
              type="date"
              value={customStart}
              max={customEnd || todayIso}
              onChange={(event) => setCustomStart(event.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/90">
            Date de fin
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={todayIso}
              onChange={(event) => setCustomEnd(event.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-white/80">Chiffre d&apos;affaires</p>
          {isLoading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-white/20" />
          ) : (
            <p className="mt-1 text-2xl font-bold">
              {formatMoney(stats.revenue, stats.currency)}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-white/80">Commandes</p>
          {isLoading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-white/20" />
          ) : (
            <p className="mt-1 text-2xl font-bold">
              {stats.orderCount}{" "}
              <span className="text-base font-medium text-white/80">
                terminées
              </span>
            </p>
          )}
        </div>
      </div>

      <Link
        href={`/vendors/${vendorId}`}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30"
      >
        <CategoryIcon icon="Ionicons/share-outline" size={16} color="#fff" />
        Voir mon profil public
      </Link>
    </div>
  );
}
