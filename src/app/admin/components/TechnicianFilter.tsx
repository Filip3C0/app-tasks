"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Technician = {
  uid: string;
  name: string;
};

type Ticket = {
  assignedTo?: {
    uid: string;
    name: string;
  } | null;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  tickets: Ticket[];
};

export function TechnicianFilter({ value, onChange, tickets }: Props) {
  // 🔍 Extrai técnicos únicos dos tickets
  const technicians: Technician[] = Array.from(
    new Map(
      tickets
        .filter((t) => t.assignedTo)
        .map((t) => [t.assignedTo!.uid, t.assignedTo!]),
    ).values(),
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-indigo-100">
        <SelectValue placeholder="Todos os técnicos" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="todos">Todos</SelectItem>

        {technicians.map((t) => (
          <SelectItem key={t.uid} value={t.uid}>
            {t.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
