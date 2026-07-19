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
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
      onClick={() => navigate('/habits/new')}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
