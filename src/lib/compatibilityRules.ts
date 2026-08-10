// src/lib/compatibilityRules.ts
import type { Product, CompatibilityReport } from "@/types";

/**
 * Checks compatibility between selected PC hardware components.
 * 
 * Expected categories:
 * - procesadores (CPU)
 * - placas (Motherboard)
 * - ram (RAM)
 * - fuentes (PSU)
 * - gabinetes (Case)
 * - refrigeracion (Cooler)
 * - graficas (GPU)
 */
export function checkCompatibility(selections: Record<string, Product | null>): CompatibilityReport {
  const warnings: string[] = [];
  let compatible = true;

  const cpu = selections["procesadores"];
  const mobo = selections["placas"];
  const ram = selections["ram"];
  const psu = selections["fuentes"];
  const gpu = selections["graficas"];
  const cabinet = selections["gabinetes"];
  const cooler = selections["refrigeracion"];

  // 1. CPU <-> Motherboard Socket Check
  if (cpu && mobo) {
    const cpuSocket = cpu.especificaciones?.socket || "";
    const moboSocket = mobo.especificaciones?.socket || "";

    if (cpuSocket && moboSocket && cpuSocket.trim().toLowerCase() !== moboSocket.trim().toLowerCase()) {
      warnings.push(`Incompatibilidad de Socket: El procesador requiere ${cpuSocket} pero la placa madre tiene socket ${moboSocket}.`);
      compatible = false;
    }
  }

  // 2. RAM <-> Motherboard Memory Type Check (DDR4 vs DDR5)
  if (ram && mobo) {
    const ramType = ram.especificaciones?.tipo || "";
    const moboRamType = mobo.especificaciones?.tipoMemoria || mobo.especificaciones?.tipo || "";

    if (ramType && moboRamType && !moboRamType.toLowerCase().includes(ramType.toLowerCase())) {
      warnings.push(`Incompatibilidad de RAM: La memoria es ${ramType} pero la placa madre soporta ${moboRamType}.`);
      compatible = false;
    }
  }

  // 3. GPU/CPU <-> PSU Wattage Power Check
  if (psu) {
    const psuPowerStr = psu.especificaciones?.potencia || "";
    const psuPower = parseInt(psuPowerStr.replace(/\D/g, ""), 10);

    if (!isNaN(psuPower)) {
      let estimatedConsumption = 150; // Base consumption for motherboard, RAM, fans, SSD

      if (cpu) {
        const cpuTdpStr = cpu.especificaciones?.tdp || "";
        const cpuTdp = parseInt(cpuTdpStr.replace(/\D/g, ""), 10);
        if (!isNaN(cpuTdp)) estimatedConsumption += cpuTdp;
      }

      if (gpu) {
        const gpuTdpStr = gpu.especificaciones?.tdp || "";
        const gpuTdp = parseInt(gpuTdpStr.replace(/\D/g, ""), 10);
        if (!isNaN(gpuTdp)) estimatedConsumption += gpuTdp;
      }

      // Safe buffer: PSU should be at least estimated consumption + 20% buffer
      const requiredPower = Math.ceil(estimatedConsumption * 1.2);
      if (psuPower < requiredPower) {
        warnings.push(`Energía Insuficiente: La fuente seleccionada es de ${psuPower}W, pero el consumo estimado del sistema con holgura es de ${requiredPower}W (TDP CPU+GPU: ${estimatedConsumption - 150}W + 150W base). Se recomienda una fuente de mayor potencia.`);
        // Note: We flag this as a warning but don't hard block compatibility unless critical (e.g. power difference > 50W)
        if (psuPower < estimatedConsumption) {
          compatible = false;
        }
      }
    }
  }

  // 4. Motherboard Size <-> Cabinet Case Form Factor Check
  if (mobo && cabinet) {
    const moboForm = (mobo.especificaciones?.factor || "").toLowerCase();
    const caseForm = (cabinet.especificaciones?.factor || "").toLowerCase();

    // Standard cases fit smaller boards, but small cases don't fit larger boards
    // Case factors: "full tower", "mid tower", "mini tower", "itx"
    // Mobo factors: "atx", "micro-atx", "mini-itx", "e-atx"
    if (moboForm && caseForm) {
      const isMoboATX = moboForm.includes("atx") && !moboForm.includes("micro") && !moboForm.includes("mini");
      const isMoboEATX = moboForm.includes("e-atx") || moboForm.includes("eatx");
      const isMoboMicroATX = moboForm.includes("micro");
      const isMoboMiniITX = moboForm.includes("mini") || moboForm.includes("itx");

      const isCaseITXOnly = caseForm.includes("mini") || caseForm.includes("itx");
      const isCaseMicroATXOnly = caseForm.includes("micro") && !caseForm.includes("mid") && !caseForm.includes("full");

      if (isMoboEATX && !caseForm.includes("full") && !caseForm.includes("evo")) {
        warnings.push("Formato de Gabinete: Una placa madre E-ATX requiere un gabinete Full Tower.");
        compatible = false;
      } else if (isMoboATX && isCaseITXOnly) {
        warnings.push("Formato de Gabinete: Placa madre ATX no cabe en un gabinete Mini-ITX.");
        compatible = false;
      } else if (isMoboATX && isCaseMicroATXOnly) {
        warnings.push("Formato de Gabinete: Placa madre ATX no cabe en un gabinete Micro-ATX.");
        compatible = false;
      } else if (isMoboMicroATX && isCaseITXOnly) {
        warnings.push("Formato de Gabinete: Placa madre Micro-ATX no cabe en un gabinete Mini-ITX.");
        compatible = false;
      }
    }
  }

  // 5. Cooler Socket compatibility
  if (cooler && cpu) {
    const coolerSockets = (cooler.especificaciones?.sockets || "").toLowerCase();
    const cpuSocket = (cpu.especificaciones?.socket || "").toLowerCase();

    if (coolerSockets && cpuSocket && !coolerSockets.includes(cpuSocket)) {
      warnings.push(`Refrigeración incompatible: El disipador no especifica soporte para el socket del procesador (${cpu.especificaciones.socket}).`);
      // Warning only, as manuals may be outdated or adapters might be included
    }
  }

  return { compatible, warnings };
}
