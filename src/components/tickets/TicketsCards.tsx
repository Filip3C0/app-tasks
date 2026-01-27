import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ChamadoCardProps {
  numero: string
  descricao: string
  sala: string
  setor: string
  status: "aberto" | "em_atendimento" | "finalizado"
}

export default function ChamadoCard({
  numero,
  descricao,
  sala,
  setor,
  status,
}: ChamadoCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <span className="font-semibold">{numero}</span>

        <Badge
          variant={
            status === "aberto"
              ? "destructive"
              : status === "em_atendimento"
              ? "secondary"
              : "default"
          }
        >
          {status.replace("_", " ")}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {descricao}
        </p>

        <div className="text-sm">
          <strong>Setor:</strong> {setor}
        </div>

        <div className="text-sm">
          <strong>Sala:</strong> {sala}
        </div>
      </CardContent>
    </Card>
  )
}
