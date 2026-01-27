import { Card, CardContent } from "@/components/ui/card";

interface Ticket {
  id: string;
  code: string;
  requester: string;
  building: string;
  status: string;
}

interface Props {
  tickets: Ticket[];
}

export function TicketsList({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum chamado encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardContent className="space-y-1 p-4">
            <strong>{ticket.code}</strong>
            <p>Solicitante: {ticket.requester}</p>
            <p>Prédio: {ticket.building}</p>
            <p>Status: {ticket.status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
