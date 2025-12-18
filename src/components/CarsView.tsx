import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Car } from '@/pages/Index';

interface CarsViewProps {
  cars: Car[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
}

const CarsView = ({ cars, setCars }: CarsViewProps) => {
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [addBrandDialog, setAddBrandDialog] = useState(false);
  const [addModelDialog, setAddModelDialog] = useState<string | null>(null);
  const [deleteBrandDialog, setDeleteBrandDialog] = useState<string | null>(null);
  const [deleteModelDialog, setDeleteModelDialog] = useState<{ brand: string; model: string } | null>(null);
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');

  const sortedCars = [...cars].sort((a, b) => a.brand.localeCompare(b.brand, 'ru'));

  const handleAddBrand = () => {
    if (!newBrand.trim()) return;
    
    if (cars.find(c => c.brand.toLowerCase() === newBrand.toLowerCase())) {
      return;
    }

    setCars(prev => [...prev, { brand: newBrand.trim(), models: [] }]);
    setNewBrand('');
    setAddBrandDialog(false);
  };

  const handleAddModel = (brand: string) => {
    if (!newModel.trim()) return;

    setCars(prev => prev.map(car => {
      if (car.brand === brand) {
        if (car.models.includes(newModel.trim())) {
          return car;
        }
        return { ...car, models: [...car.models, newModel.trim()] };
      }
      return car;
    }));

    setNewModel('');
    setAddModelDialog(null);
  };

  const handleDeleteBrand = (brand: string) => {
    setCars(prev => prev.filter(c => c.brand !== brand));
    setDeleteBrandDialog(null);
  };

  const handleDeleteModel = (brand: string, model: string) => {
    setCars(prev => prev.map(car => {
      if (car.brand === brand) {
        return { ...car, models: car.models.filter(m => m !== model) };
      }
      return car;
    }));
    setDeleteModelDialog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">База автомобилей</h2>
        <Button onClick={() => setAddBrandDialog(true)}>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить марку
        </Button>
      </div>

      <div className="space-y-3">
        {sortedCars.map((car) => (
          <Collapsible
            key={car.brand}
            open={expandedBrand === car.brand}
            onOpenChange={(open) => setExpandedBrand(open ? car.brand : null)}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger className="flex items-center gap-3 flex-1">
                  <Icon 
                    name={expandedBrand === car.brand ? "ChevronDown" : "ChevronRight"} 
                    size={20} 
                  />
                  <span className="font-semibold text-lg">{car.brand}</span>
                  <span className="text-sm text-muted-foreground">
                    {car.models.length} моделей
                  </span>
                </CollapsibleTrigger>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteBrandDialog(car.brand)}
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <CollapsibleContent className="mt-4 animate-accordion-down">
                <div className="space-y-2 pl-8">
                  {car.models.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет моделей</p>
                  ) : (
                    car.models.map((model) => (
                      <div key={model} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                        <span>{model}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteModelDialog({ brand: car.brand, model })}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    ))
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModelDialog(car.brand)}
                    className="mt-2"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить модель
                  </Button>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      <Dialog open={addBrandDialog} onOpenChange={setAddBrandDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить марку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Название марки</Label>
              <Input
                id="brand"
                placeholder="Toyota"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBrandDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddBrand} disabled={!newBrand.trim()}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!addModelDialog} onOpenChange={(open) => !open && setAddModelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить модель для {addModelDialog}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model">Название модели</Label>
              <Input
                id="model"
                placeholder="Camry"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addModelDialog && handleAddModel(addModelDialog)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModelDialog(null)}>
              Отмена
            </Button>
            <Button onClick={() => addModelDialog && handleAddModel(addModelDialog)} disabled={!newModel.trim()}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBrandDialog} onOpenChange={() => setDeleteBrandDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить марку {deleteBrandDialog}?</AlertDialogTitle>
            <AlertDialogDescription>
              Все модели этой марки также будут удалены. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteBrandDialog && handleDeleteBrand(deleteBrandDialog)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteModelDialog} onOpenChange={() => setDeleteModelDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить модель {deleteModelDialog?.model}?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteModelDialog && handleDeleteModel(deleteModelDialog.brand, deleteModelDialog.model)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CarsView;
