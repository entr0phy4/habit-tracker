import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router';
import { normalizeHabitColor } from '@/domain/colors';
import type { Habit } from '@/domain/types';

interface DashboardCardProps {
  habit: Habit;
  currentStreak: number;
}

export function DashboardCard({ habit, currentStreak }: DashboardCardProps) {
  const navigate = useNavigate();
  const accent = normalizeHabitColor(habit.color);

  return (
    <button
      type="button"
      data-habit-color={accent}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm hover:bg-[#1c2128] active:scale-[0.98]"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
      aria-label={`View history for ${habit.name}, ${currentStreak} day streak`}
      onClick={() => navigate(`/habits/${habit.id}/history`)}
    >
      <span className="min-w-0 flex-1 truncate">{habit.name}</span>
      <span
        className="flex shrink-0 items-center gap-1"
        aria-label={`${currentStreak} day streak`}
      >
        <Flame className="h-4 w-4" style={{ color: accent }} aria-hidden />
        <span className="text-xs font-semibold text-foreground">
          {currentStreak}
        </span>
      </span>
    </button>
  );
}
