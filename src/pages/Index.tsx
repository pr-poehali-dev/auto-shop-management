import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarView from '@/components/CalendarView';
import ClientsView from '@/components/ClientsView';
import CarsView from '@/components/CarsView';
import SettingsView from '@/components/SettingsView';
import Icon from '@/components/ui/icon';

export interface Appointment {
  id: string;
  date: string;
  time: string;
  carBrand: string;
  carModel: string;
  plateNumber?: string;
  color?: string;
  notes?: string;
  status?: 'arrived' | 'missed' | null;
}

export interface Car {
  brand: string;
  models: string[];
}

export interface ClientData {
  id: string;
  name?: string;
  phone?: string;
  carBrand: string;
  carModel: string;
  plateNumber?: string;
  color?: string;
  appointments: Appointment[];
}

const Index = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cars, setCars] = useState<Car[]>([
    { brand: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'] },
    { brand: 'BMW', models: ['X5', '3 Series', '5 Series', 'X3'] },
    { brand: 'Mercedes-Benz', models: ['E-Class', 'C-Class', 'GLE', 'S-Class'] },
    { brand: 'Audi', models: ['A4', 'A6', 'Q5', 'Q7'] },
    { brand: 'Volkswagen', models: ['Polo', 'Passat', 'Tiguan', 'Golf'] },
  ]);

  const clients = useMemo(() => {
    const clientMap = new Map<string, ClientData>();

    appointments.forEach((apt) => {
      const clientId = apt.plateNumber
        ? apt.plateNumber.toUpperCase().replace(/\s+/g, '')
        : `${apt.carBrand}|${apt.carModel}|${apt.color || 'Без цвета'}`;

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          carBrand: apt.carBrand,
          carModel: apt.carModel,
          plateNumber: apt.plateNumber,
          color: apt.color,
          appointments: [],
        });
      }

      clientMap.get(clientId)!.appointments.push(apt);
    });

    clientMap.forEach((client) => {
      client.appointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    });

    return Array.from(clientMap.values());
  }, [appointments]);

  const getClientReliability = (clientId: string): 'reliable' | 'unreliable' | 'neutral' => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return 'neutral';

    const now = new Date();
    const pastAppointments = client.appointments.filter((apt) => {
      const aptDate = new Date(`${apt.date}T${apt.time}`);
      return aptDate < now && apt.status;
    });

    if (pastAppointments.length === 0) return 'neutral';

    const lastCompleted = pastAppointments[pastAppointments.length - 1];
    return lastCompleted.status === 'missed' ? 'unreliable' : 'reliable';
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container max-w-screen-xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center leading-tight">
            Автомастерская Александра Беляева
          </h1>
        </div>
      </header>

      <main className="container max-w-screen-xl mx-auto px-4 py-6">
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Icon name="Calendar" size={18} />
              <span className="hidden sm:inline">Календарь</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Icon name="Users" size={18} />
              <span className="hidden sm:inline">Клиенты</span>
            </TabsTrigger>
            <TabsTrigger value="cars" className="flex items-center gap-2">
              <Icon name="Car" size={18} />
              <span className="hidden sm:inline">Автомобили</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Icon name="Settings" size={18} />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="animate-fade-in">
            <CalendarView
              appointments={appointments}
              setAppointments={setAppointments}
              cars={cars}
              getClientReliability={getClientReliability}
            />
          </TabsContent>

          <TabsContent value="clients" className="animate-fade-in">
            <ClientsView clients={clients} appointments={appointments} setAppointments={setAppointments} cars={cars} />
          </TabsContent>

          <TabsContent value="cars" className="animate-fade-in">
            <CarsView cars={cars} setCars={setCars} />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <SettingsView appointments={appointments} setAppointments={setAppointments} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;