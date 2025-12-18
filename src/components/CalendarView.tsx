import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import TimeSlot from './TimeSlot';
import AppointmentDialog from './AppointmentDialog';
import type { Appointment, Car } from '@/pages/Index';

interface CalendarViewProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  cars: Car[];
  getClientReliability: (clientId: string) => 'reliable' | 'unreliable' | 'neutral';
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const CalendarView = ({ appointments, setAppointments, cars, getClientReliability }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const timeSlots = generateTimeSlots();

  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const monday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(selectedDate);

  const formatFullDate = (date: Date) => {
    const dayName = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][date.getDay() === 0 ? 6 : date.getDay() - 1];
    return `${dayName}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const dayAppointments = appointments.filter(apt => apt.date === selectedDateString);

  const appointmentsByTime = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    dayAppointments.forEach(apt => {
      if (!map.has(apt.time)) {
        map.set(apt.time, []);
      }
      map.get(apt.time)!.push(apt);
    });
    return map;
  }, [dayAppointments]);

  const handleAddAppointment = (time: string) => {
    setSelectedTime(time);
    setIsDialogOpen(true);
  };

  const handleAddCustom = () => {
    setSelectedTime(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={goToPrevDay}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <h2 className="text-lg font-semibold text-center flex-1">
            {formatFullDate(selectedDate)}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <Icon name="ChevronRight" size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDates.map((date, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all hover:bg-accent ${
                date.toDateString() === selectedDate.toDateString()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card'
              }`}
            >
              <span className="text-xs mb-1">{DAYS[i]}</span>
              <span className="text-lg font-semibold">{date.getDate()}</span>
            </button>
          ))}
        </div>

        {!isToday(selectedDate) && (
          <Button onClick={goToToday} className="w-full" variant="outline">
            Вернуться к сегодняшнему дню
          </Button>
        )}
      </Card>

      <div className="space-y-2">
        {timeSlots.map((time) => (
          <TimeSlot
            key={time}
            time={time}
            appointments={appointmentsByTime.get(time) || []}
            onAdd={() => handleAddAppointment(time)}
            onUpdate={setAppointments}
            getClientReliability={getClientReliability}
          />
        ))}
      </div>

      <Button onClick={handleAddCustom} className="w-full sticky bottom-4 shadow-lg" size="lg">
        <Icon name="Plus" size={20} className="mr-2" />
        Добавить запись
      </Button>

      <AppointmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDateString}
        selectedTime={selectedTime}
        cars={cars}
        onSave={(apt) => {
          setAppointments(prev => [...prev, apt]);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default CalendarView;
