import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import type { Appointment, Car } from '@/pages/Index';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  selectedTime: string | null;
  cars: Car[];
  onSave: (appointment: Appointment) => void;
}

const AppointmentDialog = ({ open, onOpenChange, selectedDate, selectedTime, cars, onSave }: AppointmentDialogProps) => {
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState(selectedTime || '09:00');
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const availableModels = useMemo(() => {
    const car = cars.find(c => c.brand === carBrand);
    return car ? car.models : [];
  }, [carBrand, cars]);

  const handleSave = () => {
    if (!carBrand || !carModel) {
      return;
    }

    const newAppointment: Appointment = {
      id: `${Date.now()}-${Math.random()}`,
      date: selectedDate,
      time,
      carBrand,
      carModel,
      plateNumber: plateNumber || undefined,
      color: color || undefined,
      notes: notes || undefined,
      status: null,
    };

    onSave(newAppointment);
    handleClose();
  };

  const handleClose = () => {
    setCarBrand('');
    setCarModel('');
    setPlateNumber('');
    setColor('');
    setNotes('');
    setTime(selectedTime || '09:00');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Марка автомобиля *</Label>
            <Popover open={brandOpen} onOpenChange={setBrandOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {carBrand || 'Выберите марку'}
                  <Icon name="ChevronsUpDown" size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Поиск марки..." />
                  <CommandList>
                    <CommandEmpty>Марка не найдена</CommandEmpty>
                    <CommandGroup>
                      {cars.map((car) => (
                        <CommandItem
                          key={car.brand}
                          value={car.brand}
                          onSelect={() => {
                            setCarBrand(car.brand);
                            setCarModel('');
                            setBrandOpen(false);
                          }}
                        >
                          {car.brand}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {carBrand && (
            <div className="space-y-2">
              <Label>Модель *</Label>
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {carModel || 'Выберите модель'}
                    <Icon name="ChevronsUpDown" size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Поиск модели..." />
                    <CommandList>
                      <CommandEmpty>Модель не найдена</CommandEmpty>
                      <CommandGroup>
                        {availableModels.map((model) => (
                          <CommandItem
                            key={model}
                            value={model}
                            onSelect={() => {
                              setCarModel(model);
                              setModelOpen(false);
                            }}
                          >
                            {model}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="time">Время</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plate">Госномер</Label>
            <Input
              id="plate"
              placeholder="А123БВ77"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Цвет</Label>
            <Input
              id="color"
              placeholder="Белый"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечание</Label>
            <Textarea
              id="notes"
              placeholder="Дополнительная информация"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!carBrand || !carModel}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
