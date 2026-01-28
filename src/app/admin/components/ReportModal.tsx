"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";

type Ticket = {
  id: string;
  code: string;
  buildingId: string;
  status: "aberto" | "em_atendimento" | "finalizado";
  assignedTo?: {
    uid: string;
    name: string;
  } | null;
  createdAt?: any;
};

type Building = {
  id: string;
  name: string;
};

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  tickets: Ticket[];
  buildings: Building[];
}

export function ReportModal({
  open,
  onClose,
  tickets,
  buildings,
}: ReportModalProps) {
  const [reportType, setReportType] = useState<"dia" | "mes" | "ano">("mes");
  const [filterType, setFilterType] = useState<
    "todos" | "building" | "technician"
  >("todos");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Get unique technicians from tickets
  const technicians = Array.from(
    new Map(
      tickets
        .filter((t) => t.assignedTo)
        .map((t) => [t.assignedTo!.uid, t.assignedTo!]),
    ).values(),
  );

  if (!open) return null;

  const generateReport = () => {
    // Filter tickets based on criteria
    let filteredTickets = [...tickets];

    // Filter by building/technician
    if (filterType === "building" && selectedBuilding) {
      filteredTickets = filteredTickets.filter(
        (t) => t.buildingId === selectedBuilding,
      );
    } else if (filterType === "technician" && selectedTechnician) {
      filteredTickets = filteredTickets.filter(
        (t) => t.assignedTo?.uid === selectedTechnician,
      );
    }

    // Filter by date range
    const date = new Date(selectedDate);
    let startDate = new Date(date);
    let endDate = new Date(date);

    if (reportType === "dia") {
      endDate.setDate(endDate.getDate() + 1);
    } else if (reportType === "mes") {
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    } else if (reportType === "ano") {
      startDate = new Date(date.getFullYear(), 0, 1);
      endDate = new Date(date.getFullYear() + 1, 0, 1);
    }

    filteredTickets = filteredTickets.filter((t) => {
      const ticketDate = t.createdAt?.toDate?.() || new Date(t.createdAt);
      return ticketDate >= startDate && ticketDate < endDate;
    });

    // Calculate statistics
    const abertos = filteredTickets.filter((t) => t.status === "aberto").length;
    const emAtendimento = filteredTickets.filter(
      (t) => t.status === "em_atendimento",
    ).length;
    const finalizados = filteredTickets.filter(
      (t) => t.status === "finalizado",
    ).length;
    const total = filteredTickets.length;
    const taxa = total > 0 ? Math.round((finalizados / total) * 100) : 0;

    // Generate PDF (styled)
    generateStyledPDF(
      filteredTickets,
      abertos,
      emAtendimento,
      finalizados,
      taxa,
    );

    onClose();
  };

  const generateStyledPDF = (
    ticketList: Ticket[],
    abertos: number,
    emAtendimento: number,
    finalizados: number,
    taxa: number,
  ) => {
    const reportTitle = `RELATÓRIO DE CHAMADOS - ${reportType.toUpperCase()}`;
    const reportDate = new Date().toLocaleDateString("pt-BR");
    const filterInfo =
      filterType === "building"
        ? `Prédio: ${buildings.find((b) => b.id === selectedBuilding)?.name || "N/A"}`
        : filterType === "technician"
          ? `Técnico: ${technicians.find((t) => t.uid === selectedTechnician)?.name || "N/A"}`
          : "Todos os Filtros";

    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    const hexToRgb = (hex: string) => {
      const normalized = hex.replace("#", "");
      const bigint = parseInt(normalized, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b];
    };

    // Header band (dark indigo)
    const headerColor = hexToRgb("#4f46e5");
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(0, 0, pageWidth, 36, "F");

    // Title (white)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, margin, 24);

    // Subtitle (date + filter)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(230, 230, 255);
    doc.text(`Data do Relatório: ${reportDate}`, margin, 44);
    // ensure second column doesn't overflow page width
    const secondColX = Math.min(margin + 110, pageWidth - margin - 60);
    doc.text(`Filtro: ${filterInfo}`, secondColX, 44);

    y = 54;

    // Summary header
    const lightIndigo = hexToRgb("#4f46e5");
    doc.setTextColor(lightIndigo[0], lightIndigo[1], lightIndigo[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO EXECUTIVO", margin, y);
    y += 8;

    // Summary rows with small bar indicators
    const summaryRows: Array<{
      label: string;
      value: number | string;
      color: string;
    }> = [
      {
        label: "Total de Chamados",
        value: ticketList.length,
        color: "#4f46e5",
      },
      { label: "Abertos", value: abertos, color: "#fb7185" },
      { label: "Em Atendimento", value: emAtendimento, color: "#f59e0b" },
      { label: "Finalizados", value: finalizados, color: "#34d399" },
      { label: "Taxa de Conclusão", value: `${taxa}%`, color: "#60a5fa" },
    ];

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(230, 230, 255);

    summaryRows.forEach((row) => {
      const labelX = margin;
      const valueX = margin + 110;
      doc.text(`${row.label}:`, labelX, y);
      doc.text(String(row.value), valueX, y);

      // draw a small bar visualization for numeric values
      if (typeof row.value === "number" && ticketList.length > 0) {
        const barX = valueX + 20;
        const maxBarWidth = 60;
        const width = Math.round(
          (row.value / Math.max(1, ticketList.length)) * maxBarWidth,
        );
        const rgb = hexToRgb(row.color);
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.rect(barX, y - 4.5, width, 3.5, "F");
      }

      y += 8;
      // If we're near the bottom, add a new page
      if (y > doc.internal.pageSize.getHeight() - margin - 20) {
        doc.addPage();
        y = margin;
      }
    });

    // Footer note
    y += 8;
    const footerColor = hexToRgb("#4f46e5");
    doc.setTextColor(footerColor[0], footerColor[1], footerColor[2]);
    doc.setFontSize(9);
    doc.text("Relatório gerado pelo sistema — layout indigo", margin, y);

    const filename = `relatorio-chamados-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto rounded-3xl border border-indigo-500/30 bg-slate-900/80 backdrop-blur-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-indigo-500/30 px-8 py-6 flex items-center justify-between sticky top-0 bg-slate-900/80">
            <div>
              <h2 className="text-3xl font-extrabold text-white">
                Gerar Relatório
              </h2>
              <p className="text-sm text-indigo-300/70 mt-2">
                Configure os filtros e período para gerar o relatório
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-indigo-500 hover:text-white"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Tipo de Período */}
            <div>
              <label className="block text-sm font-semibold text-indigo-500 mb-3">
                Período do Relatório
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["dia", "mes", "ano"] as const).map((tipo) => (
                  <Button
                    key={tipo}
                    onClick={() => setReportType(tipo)}
                    className={`px-6 py-3 rounded-xl font-medium text-sm transition ${
                      reportType === tipo
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-800 text-indigo-500 hover:bg-slate-700"
                    }`}
                  >
                    {tipo === "dia"
                      ? "Por Dia"
                      : tipo === "mes"
                        ? "Por Mês"
                        : "Por Ano"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-semibold text-indigo-500 mb-3">
                Selecione a Data
              </label>
              <Input
                type={
                  reportType === "dia"
                    ? "date"
                    : reportType === "mes"
                      ? "month"
                      : "year"
                }
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-indigo-100"
              />
            </div>

            {/* Filtro */}
            <div>
              <label className="block text-sm font-semibold text-indigo-500 mb-3">
                Filtrar Por
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(["todos", "building", "technician"] as const).map((tipo) => (
                  <Button
                    key={tipo}
                    onClick={() => {
                      setFilterType(tipo);
                      setSelectedBuilding("");
                      setSelectedTechnician("");
                    }}
                    className={`px-6 py-3 rounded-xl font-medium text-sm transition ${
                      filterType === tipo
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-800 text-indigo-500 hover:bg-slate-700"
                    }`}
                  >
                    {tipo === "todos"
                      ? "Todos"
                      : tipo === "building"
                        ? "Prédio"
                        : "Técnico"}
                  </Button>
                ))}
              </div>

              {/* Seletor Dinâmico */}
              {filterType === "building" && (
                <SelectPrimitive.Root
                  value={selectedBuilding}
                  onValueChange={setSelectedBuilding}
                >
                  <SelectTrigger className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-indigo-100">
                    <SelectValue placeholder="Selecione um prédio..." />
                  </SelectTrigger>
                  <SelectPrimitive.Portal>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPrimitive.Portal>
                </SelectPrimitive.Root>
              )}

              {filterType === "technician" && (
                <SelectPrimitive.Root
                  value={selectedTechnician}
                  onValueChange={setSelectedTechnician}
                >
                  <SelectTrigger className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-indigo-100">
                    <SelectValue placeholder="Selecione um técnico..." />
                  </SelectTrigger>
                  <SelectPrimitive.Portal>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.uid} value={tech.uid}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPrimitive.Portal>
                </SelectPrimitive.Root>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-indigo-500/30 px-8 py-4 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/80">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 py-3 rounded-xl border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition text-base"
            >
              Cancelar
            </Button>
            <Button
              onClick={generateReport}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md transition text-base"
            >
              Gerar Relatório
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
