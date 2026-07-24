import { useRef, useState } from 'react';
import { CalendarDays, Flame } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { normalizeHabitColor } from '@/domain/colors';
import type { Habit } from '@/domain/types';
import { useStreak } from '@/hooks/useStreak';
import { WeekDayDots } from './WeekDayDots';
import { WeekQuotaChip } from './WeekQuotaChip';

const SWIPE_THRESHOLD = 50;
const REWARD_MS = 280;

interface HabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  todayKey?: string;
  weekCompletions?: number;
  onToggle: () => void;
}

export function HabitRow({
  habit,
  isCompleted,
  todayKey,
  weekCompletions = 0,
  onToggle,
}: HabitRowProps) {
  const navigate = useNavigate();
  const { currentStreak, isLoading } = useStreak(habit, todayKey);
  const accent = normalizeHabitColor(habit.color);
  const startX = useRef(0);
  const startY = useRef(0);
  const isTouch = useRef(false);
  const rewardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showReward, setShowReward] = useState(false);

  function playCheckinReward() {
    setShowReward(true);
    if (rewardTimer.current) {
      clearTimeout(rewardTimer.current);
    }
    rewardTimer.current = setTimeout(() => {
      setShowReward(false);
      rewardTimer.current = null;
    }, REWARD_MS);
  }

  function requestToggle() {
    if (!isCompleted) {
      playCheckinReward();
    }
    onToggle();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX;
    startY.current = event.clientY;
    isTouch.current = event.pointerType === 'touch';

    if (event.pointerType === 'touch') {
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || !isTouch.current) {
      return;
    }

    const deltaX = event.clientX - startX.current;
    const deltaY = event.clientY - startY.current;

    if (deltaX > 0 && deltaX > Math.abs(deltaY)) {
      setTranslateX(Math.min(deltaX, 80));
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const deltaX = event.clientX - startX.current;
    const deltaY = event.clientY - startY.current;

    if (isTouch.current && deltaX > SWIPE_THRESHOLD && deltaX > Math.abs(deltaY)) {
      requestToggle();
    }

    setTranslateX(0);
    setIsDragging(false);
  }

  function handleRowClick() {
    if (!isTouch.current) {
      requestToggle();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border">
      <div
        className="absolute inset-y-0 left-0 w-12"
        style={{ backgroundColor: `${accent}33` }}
        aria-hidden
      />
      <div
        data-testid="habit-row-toggle"
        data-habit-color={accent}
        data-checkin-reward={showReward ? 'true' : undefined}
        role="button"
        tabIndex={0}
        className={cn(
          'relative flex min-h-11 touch-pan-y items-center gap-3 px-4 py-3 transition-transform active:scale-[0.98]',
          isCompleted ? 'bg-muted' : 'bg-card hover:bg-[#1c2128]',
          showReward && 'habit-checkin-reward',
        )}
        style={{
          transform: translateX > 0 ? `translateX(${translateX}px)` : undefined,
          borderLeft: `4px solid ${accent}`,
          ['--habit-reward-color' as string]: accent,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleRowClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            requestToggle();
          }
        }}
      >
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-sm',
            isCompleted && 'text-muted-foreground line-through',
          )}
        >
          {habit.name}
        </span>
        {!isLoading && (
          <span
            className="flex shrink-0 items-center gap-1"
            aria-label={
              habit.frequency.type === 'times_per_week'
                ? `${currentStreak} week streak`
                : `${currentStreak} day streak`
            }
          >
            <Flame className="h-4 w-4" style={{ color: accent }} aria-hidden />
            <span className="text-xs font-semibold text-foreground">
              {currentStreak}
            </span>
          </span>
        )}
        {habit.frequency.type === 'times_per_week' ? (
          <WeekQuotaChip
            done={weekCompletions}
            times={habit.frequency.times}
            accentColor={accent}
          />
        ) : (
          <WeekDayDots
            frequency={habit.frequency}
            accentColor={accent}
            className="shrink-0"
          />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0"
          aria-label={`Edit history for ${habit.name}`}
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/habits/${habit.id}/history`);
          }}
        >
          <CalendarDays className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
