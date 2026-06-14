"use client";
// src/components/configurator/StepperSidebar.tsx

import { STEP_LABELS, STEP_ICONS } from "@/types";
import { useConfiguratorStore } from "@/store/configuratorStore";

interface StepperSidebarProps {
  onStepChange: (step: number) => void;
}

export default function StepperSidebar({ onStepChange }: StepperSidebarProps) {
  const activeStep  = useConfiguratorStore((s) => s.activeStep);
  const selections  = useConfiguratorStore((s) => s.selections);

  const isStepEnabled = (step: number): boolean => {
    if (step === 0) return true;
    // Each step requires the previous one to have a selection
    return selections[step - 1] !== null;
  };

  return (
    <aside className="w-full md:w-[220px] lg:w-[240px] shrink-0 glass-panel p-6 rounded-xl h-fit sticky top-24">
      <h2 className="font-poppins text-headline-md text-on-surface mb-6 pb-3 border-b border-outline-variant/20">
        Pasos
      </h2>

      <nav className="flex flex-col gap-4">
        {[0, 1, 2].map((step) => {
          const isActive   = step === activeStep;
          const isEnabled  = isStepEnabled(step);
          const isComplete = selections[step] !== null;

          return (
            <button
              key={step}
              onClick={() => isEnabled && onStepChange(step)}
              disabled={!isEnabled}
              className={`flex items-center gap-3 pl-3 py-2 border-l-2 text-left transition-all duration-200 ${
                isActive
                  ? "border-primary-container text-primary-container"
                  : isEnabled
                  ? "border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/60"
                  : "border-outline-variant/10 text-on-surface-variant/30 cursor-not-allowed"
              }`}
            >
              {isComplete && !isActive ? (
                <span className="material-symbols-outlined text-primary"
                  style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  {STEP_ICONS[step]}
                </span>
              )}
              <span className="font-montserrat text-title-lg">{STEP_LABELS[step]}</span>
            </button>
          );
        })}
      </nav>

      {/* Step progress */}
      <div className="mt-6 pt-4 border-t border-outline-variant/20">
        <div className="flex gap-1">
          {[0, 1, 2].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                selections[step] !== null
                  ? "bg-primary-container"
                  : step === activeStep
                  ? "bg-primary-container/40"
                  : "bg-outline-variant/30"
              }`}
            />
          ))}
        </div>
        <p className="font-montserrat text-[11px] text-on-surface-variant/60 mt-2">
          {selections.filter(Boolean).length} de 3 pasos completados
        </p>
      </div>
    </aside>
  );
}
