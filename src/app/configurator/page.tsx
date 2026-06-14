"use client";
// src/app/configurator/page.tsx

import { useConfiguratorStore } from "@/store/configuratorStore";
import StepperSidebar from "@/components/configurator/StepperSidebar";
import OptionGrid from "@/components/configurator/OptionGrid";
import SummarySidebar from "@/components/configurator/SummarySidebar";
import { STEP_CATEGORIES } from "@/types";
import type { Product } from "@/types";

export default function ConfiguratorPage() {
  const activeStep    = useConfiguratorStore((s) => s.activeStep);
  const selections    = useConfiguratorStore((s) => s.selections);
  const setStep       = useConfiguratorStore((s) => s.setStep);
  const selectProduct = useConfiguratorStore((s) => s.selectProduct);

  const handleSelect = (product: Product) => {
    selectProduct(activeStep, product);
    // Auto-advance to next step
    if (activeStep < 2) {
      setTimeout(() => setStep(activeStep + 1), 400);
    }
  };

  return (
    <div className="section-container py-brand-md pb-brand-xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-poppins text-display-lg-mobile md:text-display-lg font-extrabold text-primary">
          Configurador de Setup
        </h1>
        <p className="font-montserrat text-body-lg text-on-surface-variant mt-1">
          Construye tu estación de trabajo perfecta paso a paso.
        </p>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex flex-col md:flex-row gap-gutter items-start">
        {/* Left: Stepper */}
        <StepperSidebar onStepChange={setStep} />

        {/* Center: Option Grid */}
        <div className="flex-grow min-w-0">
          <OptionGrid
            activeStep={activeStep}
            category={STEP_CATEGORIES[activeStep]}
            selectedProduct={selections[activeStep]}
            onSelect={handleSelect}
          />
        </div>

        {/* Right: Summary */}
        <SummarySidebar />
      </div>
    </div>
  );
}
