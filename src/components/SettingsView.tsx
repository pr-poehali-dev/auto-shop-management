import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Appointment } from '@/pages/Index';

interface SettingsViewProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

const SettingsView = ({ appointments, setAppointments }: SettingsViewProps) => {
  const [restoreDialog, setRestoreDialog] = useState(false);
  const { toast } = useToast();

  const getFutureAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= today;
    });
  };

  const handleBackup = () => {
    const futureAppointments = getFutureAppointments();
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      appointments: futureAppointments,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoservice-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Бэкап создан',
      description: `Сохранено записей: ${futureAppointments.length}`,
    });
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        
        if (!backup.appointments || !Array.isArray(backup.appointments)) {
          throw new Error('Неверный формат файла');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate < today;
        });

        setAppointments([...pastAppointments, ...backup.appointments]);

        toast({
          title: 'Данные восстановлены',
          description: `Загружено записей: ${backup.appointments.length}`,
        });

        setRestoreDialog(false);
      } catch (error) {
        toast({
          title: 'Ошибка восстановления',
          description: 'Не удалось прочитать файл бэкапа',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const futureAppointments = getFutureAppointments();
  const backupSize = new Blob([JSON.stringify({ appointments: futureAppointments })]).size;
  const backupSizeKB = (backupSize / 1024).toFixed(2);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Настройки</h2>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon name="Database" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Бэкап данных</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Сохраняются только текущие и будущие записи
              </p>
              <div className="text-sm space-y-1 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Записей для сохранения:</span>
                  <span className="font-medium">{futureAppointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Размер файла:</span>
                  <span className="font-medium">{backupSizeKB} КБ</span>
                </div>
              </div>
              <Button onClick={handleBackup} className="w-full sm:w-auto">
                <Icon name="Download" size={18} className="mr-2" />
                Создать бэкап
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Icon name="Upload" size={24} className="text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Восстановление</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Загрузить данные из файла бэкапа. Текущие будущие записи будут заменены.
              </p>
              <Button
                onClick={() => setRestoreDialog(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Icon name="Upload" size={18} className="mr-2" />
                Восстановить из бэкапа
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent">
              <Icon name="Info" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">О приложении</h3>
              <p className="text-sm text-muted-foreground">
                Система управления записями автомастерской
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Версия 1.0.0
              </p>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={restoreDialog} onOpenChange={setRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Восстановить данные?</AlertDialogTitle>
            <AlertDialogDescription>
              Все текущие и будущие записи будут заменены данными из бэкапа. Прошлые записи останутся без изменений.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction asChild>
              <label className="cursor-pointer">
                Восстановить
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleRestore}
                />
              </label>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsView;
