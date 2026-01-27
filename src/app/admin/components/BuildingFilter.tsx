"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Building = {
  id: string;
  name: string;
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  buildings: Building[];
}

export function BuildingFilter({ value, onChange, buildings }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-indigo-100">
        <SelectValue placeholder="Todos os prédios" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="todos">Todos os prédios</SelectItem>

        {buildings.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
