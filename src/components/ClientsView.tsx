import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ClientData, Appointment } from '@/pages/Index';

interface ClientsViewProps {
  clients: ClientData[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

const ClientsView = ({ clients, appointments, setAppointments }: ClientsViewProps) => {
  const [search, setSearch] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    if (!search) return clients;

    const searchLower = search.toLowerCase();
    return clients.filter(client => 
      client.carBrand.toLowerCase().includes(searchLower) ||
      client.carModel.toLowerCase().includes(searchLower) ||
      client.plateNumber?.toLowerCase().includes(searchLower) ||
      client.color?.toLowerCase().includes(searchLower)
    );
  }, [clients, search]);

  const getClientStatus = (client: ClientData): 'reliable' | 'unreliable' | 'neutral' => {
    const now = new Date();
    const pastAppointments = client.appointments.filter(apt => {
      const aptDate = new Date(`${apt.date}T${apt.time}`);
      return aptDate < now && apt.status;
    });

    if (pastAppointments.length === 0) return 'neutral';

    const lastCompleted = pastAppointments[pastAppointments.length - 1];
    return lastCompleted.status === 'missed' ? 'unreliable' : 'reliable';
  };

  const getActiveAppointmentsCount = (client: ClientData) => {
    const now = new Date();
    return client.appointments.filter(apt => {
      const aptDate = new Date(`${apt.date}T${apt.time}`);
      return aptDate >= now;
    }).length;
  };

  const getStatusBadge = (status: 'reliable' | 'unreliable' | 'neutral') => {
    if (status === 'reliable') {
      return <span className="px-2 py-1 text-xs rounded bg-success/20 text-success">Надёжный</span>;
    }
    if (status === 'unreliable') {
      return <span className="px-2 py-1 text-xs rounded bg-warning/20 text-warning">Ненадёжный</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">Нейтральный</span>;
  };

  const getAppointmentClass = (apt: Appointment) => {
    if (apt.status === 'arrived') return 'neon-green';
    if (apt.status === 'missed') return 'neon-red';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по марке, модели, номеру или цвету..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredClients.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {search ? 'Клиенты не найдены' : 'Пока нет клиентов'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const status = getClientStatus(client);
            const activeCount = getActiveAppointmentsCount(client);

            return (
              <Collapsible
                key={client.id}
                open={expandedClient === client.id}
                onOpenChange={(open) => setExpandedClient(open ? client.id : null)}
              >
                <Card className={`p-4 ${status === 'unreliable' && activeCount > 0 ? 'neon-orange' : ''}`}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 text-left">
                        <div className="font-semibold">
                          {client.carBrand} {client.carModel}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {client.plateNumber || 'Без номера'} • {client.color || 'Без цвета'}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(status)}
                          {activeCount > 0 && (
                            <span className="px-2 py-1 text-xs rounded bg-primary/20 text-primary">
                              {activeCount} активных
                            </span>
                          )}
                        </div>
                      </div>
                      <Icon 
                        name={expandedClient === client.id ? "ChevronUp" : "ChevronDown"} 
                        size={20} 
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 space-y-3 animate-accordion-down">
                    <div className="border-t border-border pt-3">
                      <h4 className="font-semibold mb-3">История визитов</h4>
                      {client.appointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Нет записей</p>
                      ) : (
                        <div className="space-y-2">
                          {client.appointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={`p-3 rounded-lg bg-card ${getAppointmentClass(apt)}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium">
                                    {new Date(apt.date).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })} в {apt.time}
                                  </div>
                                  {apt.notes && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {apt.notes}
                                    </div>
                                  )}
                                </div>
                                {apt.status === 'arrived' && <span>✔️</span>}
                                {apt.status === 'missed' && <span>❌</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientsView;
