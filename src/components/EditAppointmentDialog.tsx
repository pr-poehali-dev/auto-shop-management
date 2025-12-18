import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Appointment } from '@/pages/Index';

interface EditAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: Appointment) => void;
}

const EditAppointmentDialog = ({ appointment, open, onOpenChange, onSave }: EditAppointmentDialogProps) => {
  const [plateNumber, setPlateNumber] = useState(appointment.plateNumber || '');
  const [color, setColor] = useState(appointment.color || '');
  const [notes, setNotes] = useState(appointment.notes || '');

  const handleSave = () => {
    onSave({
      ...appointment,
      plateNumber: plateNumber || undefined,
      color: color || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать запись</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Автомобиль</Label>
            <div className="text-sm text-muted-foreground">
              {appointment.carBrand} {appointment.carModel}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Время</Label>
            <div className="text-sm text-muted-foreground">{appointment.time}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-plate">Госномер</Label>
            <Input
              id="edit-plate"
              placeholder="А123БВ77"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-color">Цвет</Label>
            <Input
              id="edit-color"
              placeholder="Белый"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Примечание</Label>
            <Textarea
              id="edit-notes"
              placeholder="Дополнительная информация"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentDialog;
