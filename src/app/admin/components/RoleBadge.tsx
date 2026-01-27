import { Badge } from "@/components/ui/badge";

interface Props {
  role: "admin" | "service" | "field";
}

export function RoleBadge({ role }: Props) {
  const roleMap = {
    admin: {
      label: "admin",
      variant: "destructive",
    },
    service: {
      label: "service",
      variant: "default",
    },
    field: {
      label: "field",
      variant: "secondary",
    },
  } as const;

  const config = roleMap[role];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
