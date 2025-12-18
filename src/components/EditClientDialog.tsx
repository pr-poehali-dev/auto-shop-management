import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import type { ClientData, Car, Appointment } from '@/pages/Index';

interface EditClientDialogProps {
  client: ClientData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cars: Car[];
  onSave: (updates: Partial<ClientData>) => void;
}

const EditClientDialog = ({ client, open, onOpenChange, cars, onSave }: EditClientDialogProps) => {
  const [name, setName] = useState(client.name || '');
  const [phone, setPhone] = useState(client.phone || '');
  const [carSearch, setCarSearch] = useState(`${client.carBrand} ${client.carModel}`);
  const [plateNumber, setPlateNumber] = useState(client.plateNumber || '');
  const [color, setColor] = useState(client.color || '');
  const [carOpen, setCarOpen] = useState(false);

  const allCarOptions = useMemo(() => {
    const options: string[] = [];
    cars.forEach(car => {
      car.models.forEach(model => {
        options.push(`${car.brand} ${model}`);
      });
    });
    return options.sort();
  }, [cars]);

  const handleSave = () => {
    const parts = carSearch.split(' ');
    const carBrand = parts[0];
    const carModel = parts.slice(1).join(' ');

    onSave({
      name: name || undefined,
      phone: phone || undefined,
      carBrand,
      carModel,
      plateNumber: plateNumber || undefined,
      color: color || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать клиента</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Имя клиента</Label>
            <Input
              id="client-name"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Номер телефона</Label>
            <Input
              id="client-phone"
              placeholder="+7 (900) 123-45-67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Марка и модель</Label>
            <Popover open={carOpen} onOpenChange={setCarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {carSearch || 'Выберите автомобиль'}
                  <Icon name="ChevronsUpDown" size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Поиск автомобиля..." />
                  <CommandList>
                    <CommandEmpty>Автомобиль не найден</CommandEmpty>
                    <CommandGroup>
                      {allCarOptions.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={() => {
                            setCarSearch(option);
                            setCarOpen(false);
                          }}
                        >
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-plate">Госномер</Label>
            <Input
              id="client-plate"
              placeholder="А123БВ77"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-color">Цвет</Label>
            <Input
              id="client-color"
              placeholder="Белый"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!carSearch}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
