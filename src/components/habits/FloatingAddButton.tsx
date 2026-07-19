import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export function FloatingAddButton() {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      size="icon"
      aria-label="Add habit"
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95"
      onClick={() => navigate('/habits/new')}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
