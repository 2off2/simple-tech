import { Routes, Route } from "react-router-dom";
import { VisaoGeral } from "@/pages/dashboard/VisaoGeral";
import { UploadDados } from "@/pages/dashboard/UploadDados";
import { PrevisaoFluxo } from "@/pages/dashboard/PrevisaoFluxo";
import { SimulacaoCenarios } from "@/pages/dashboard/SimulacaoCenarios";
import { PrazosMedios } from "@/pages/dashboard/PrazosMedios";

export function DashboardContent() {
  return (
    <div className="flex-1 p-6">
      <Routes>
        <Route path="/" element={<VisaoGeral />} />
        <Route path="/upload" element={<UploadDados />} />
        <Route path="/previsao" element={<PrevisaoFluxo />} />
        <Route path="/simulacao" element={<SimulacaoCenarios />} />
        <Route path="/prazos-medios" element={<PrazosMedios />} />
      </Routes>
    </div>
  );
}