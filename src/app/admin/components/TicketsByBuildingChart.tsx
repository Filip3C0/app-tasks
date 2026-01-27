"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Ticket = {
  buildingId: string;
};

type Props = {
  tickets: Ticket[];
};

export function TicketsByBuildingChart({ tickets }: Props) {
  const data = Object.values(
    tickets.reduce(
      (acc, t) => {
        if (!acc[t.buildingId]) {
          acc[t.buildingId] = {
            building: t.buildingId,
            total: 0,
          };
        }

        acc[t.buildingId].total++;
        return acc;
      },
      {} as Record<string, { building: string; total: number }>,
    ),
  );

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 16, left: 0, bottom: 10 }}
      >
        <CartesianGrid vertical={false} stroke="rgba(99,102,241,0.06)" />
        <XAxis dataKey="building" stroke="#c7d2fe" tick={{ fill: "#c7d2fe" }} />
        <YAxis
          allowDecimals={false}
          stroke="#c7d2fe"
          tick={{ fill: "#c7d2fe" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15,23,42,0.95)",
            border: "none",
            color: "#eef2ff",
          }}
          itemStyle={{ color: "#eef2ff" }}
          labelStyle={{ color: "#a5b4fc" }}
        />
        <Bar
          dataKey="total"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
          barSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
