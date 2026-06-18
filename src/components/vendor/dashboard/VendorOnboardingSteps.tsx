import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import type { VendorOnboardingStepView } from "@/lib/vendor-onboarding-steps";
import Link from "next/link";

interface VendorOnboardingStepsProps {
  steps: VendorOnboardingStepView[];
  primaryColor: string;
  isLoading?: boolean;
}

export default function VendorOnboardingSteps({
  steps,
  primaryColor,
  isLoading = false,
}: VendorOnboardingStepsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => {
        const content = (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  step.completed ? "bg-white/20" : "bg-black/5"
                }`}
              >
                <CategoryIcon
                  icon={
                    step.completed
                      ? "Ionicons/checkmark"
                      : "Ionicons/ellipse-outline"
                  }
                  size={18}
                  color={step.completed ? "#fff" : TEXT_COLOR}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={`font-semibold ${
                    step.completed ? "text-white" : "text-black"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-sm ${
                    step.completed ? "text-white/90" : "text-black/60"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
            {!step.completed && step.href ? (
              <CategoryIcon
                icon="Ionicons/chevron-forward"
                size={20}
                color={TEXT_COLOR}
              />
            ) : null}
          </>
        );

        if (step.completed || !step.href) {
          return (
            <div
              key={step.id}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                step.completed
                  ? "border-transparent text-white"
                  : "border-dashed border-black/20 bg-white"
              }`}
              style={
                step.completed ? { backgroundColor: primaryColor } : undefined
              }
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={step.id}
            href={step.href}
            className="flex items-center justify-between rounded-xl border border-dashed border-black/20 bg-white p-3 transition-colors hover:bg-neutral-50"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
