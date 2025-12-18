import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import EditAppointmentDialog from './EditAppointmentDialog';
import type { Appointment } from '@/pages/Index';

interface TimeSlotProps {
  time: string;
  appointments: Appointment[];
  onAdd: () => void;
  onUpdate: React.Dispatch<React.SetStateAction<Appointment[]>>;
  getClientReliability: (clientId: string) => 'reliable' | 'unreliable' | 'neutral';
}

const TimeSlot = ({ time, appointments, onAdd, onUpdate, getClientReliability }: TimeSlotProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);

  const toggleExpanded = () => {
    if (appointments.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'arrived' | 'missed' | null) => {
    onUpdate(prev => prev.map(apt => {
      if (apt.id === id) {
        if (apt.status === newStatus) {
          return { ...apt, status: null };
        }
        return { ...apt, status: newStatus };
      }
      return apt;
    }));
  };

  const handleDelete = (id: string) => {
    onUpdate(prev => prev.filter(apt => apt.id !== id));
    setDeleteId(null);
  };

  const getClientId = (apt: Appointment) => {
    return apt.plateNumber
      ? apt.plateNumber.toUpperCase().replace(/\s+/g, '')
      : `${apt.carBrand}|${apt.carModel}|${apt.color || 'Без цвета'}`;
  };

  const getReliabilityClass = (apt: Appointment) => {
    if (apt.status === 'arrived') return 'neon-green';
    if (apt.status === 'missed') return 'neon-red';
    
    const clientId = getClientId(apt);
    const reliability = getClientReliability(clientId);
    if (reliability === 'unreliable') return 'neon-orange';
    
    return '';
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <span className="font-semibold text-lg">{time}</span>
            {appointments.length === 0 ? (
              <span className="text-muted-foreground">Свободно</span>
            ) : (
              <span className="text-muted-foreground">
                {appointments.length} {appointments.length === 1 ? 'запись' : 'записи'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={onAdd}>
              <Icon name="Plus" size={20} />
            </Button>
            {appointments.length > 0 && (
              <Button size="icon" variant="ghost" onClick={toggleExpanded}>
                <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
              </Button>
            )}
          </div>
        </div>

        {isExpanded && appointments.length > 0 && (
          <div className="mt-4 space-y-2 animate-accordion-down">
            {appointments.map((apt) => (
              <Card key={apt.id} className={`p-3 ${getReliabilityClass(apt)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {apt.carBrand} {apt.carModel}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {apt.plateNumber || 'Без номера'} – {apt.color || 'Без цвета'}
                    </div>
                    {apt.notes && (
                      <div className="text-sm text-muted-foreground mt-1">{apt.notes}</div>
                    )}
                    {getClientReliability(getClientId(apt)) === 'unreliable' && !apt.status && (
                      <div className="flex items-center gap-1 text-warning text-sm mt-1">
                        <Icon name="AlertTriangle" size={16} />
                        <span>Ненадёжный клиент</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStatusChange(apt.id, 'arrived')}
                      className={apt.status === 'arrived' ? 'text-success' : ''}
                    >
                      ✔️
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStatusChange(apt.id, 'missed')}
                      className={apt.status === 'missed' ? 'text-destructive' : ''}
                    >
                      ❌
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditAppointment(apt)}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(apt.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Запись будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editAppointment && (
        <EditAppointmentDialog
          appointment={editAppointment}
          open={!!editAppointment}
          onOpenChange={(open) => !open && setEditAppointment(null)}
          onSave={(updated) => {
            onUpdate(prev => prev.map(apt => apt.id === updated.id ? updated : apt));
            setEditAppointment(null);
          }}
        />
      )}
    </>
  );
};

export default TimeSlot;
