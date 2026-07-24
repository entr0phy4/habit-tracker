import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DEFAULT_HABIT_COLOR,
  HABIT_COLOR_PRESETS,
  normalizeHabitColor,
} from '@/domain/colors';
import type { Frequency } from '@/domain/types';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const EMPTY_NAME_ERROR = 'Enter a habit name to continue.';
const TIMES_ERROR = 'Choose how many times per week (1–7).';
const DEFAULT_TIMES = 3;

type ScheduleMode = 'specific_days' | 'times_per_week';

export interface HabitFormValues {
  name: string;
  frequency: Frequency;
  color: string;
}

interface HabitFormProps {
  submitLabel: string;
  initialValues?: HabitFormValues;
  onSubmit: (values: HabitFormValues) => Promise<void>;
}

function toFrequency(selectedDays: number[]): Frequency {
  if (selectedDays.length === 7) {
    return { type: 'daily' };
  }
  return { type: 'weekly', days: [...selectedDays].sort((a, b) => a - b) };
}

function frequencyToDays(frequency: Frequency): number[] {
  if (frequency.type === 'daily') {
    return ALL_DAYS;
  }
  if (frequency.type === 'weekly') {
    return frequency.days;
  }
  return ALL_DAYS;
}

function initialMode(frequency?: Frequency): ScheduleMode {
  return frequency?.type === 'times_per_week' ? 'times_per_week' : 'specific_days';
}

function initialTimes(frequency?: Frequency): number {
  return frequency?.type === 'times_per_week' ? frequency.times : DEFAULT_TIMES;
}

export function HabitForm({ submitLabel, initialValues, onSubmit }: HabitFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [mode, setMode] = useState<ScheduleMode>(() =>
    initialMode(initialValues?.frequency),
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialValues ? frequencyToDays(initialValues.frequency) : ALL_DAYS,
  );
  const [times, setTimes] = useState<number>(() =>
    initialTimes(initialValues?.frequency),
  );
  const [color, setColor] = useState(
    normalizeHabitColor(initialValues?.color ?? DEFAULT_HABIT_COLOR),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function selectMode(next: ScheduleMode) {
    setMode(next);
    if (next === 'times_per_week' && (times < 1 || times > 7)) {
      setTimes(DEFAULT_TIMES);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(EMPTY_NAME_ERROR);
      return;
    }

    let frequency: Frequency;
    if (mode === 'times_per_week') {
      if (!Number.isInteger(times) || times < 1 || times > 7) {
        setError(TIMES_ERROR);
        return;
      }
      frequency = { type: 'times_per_week', times };
    } else {
      if (selectedDays.length === 0) {
        setError(EMPTY_NAME_ERROR);
        return;
      }
      frequency = toFrequency(selectedDays);
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        frequency,
        color: normalizeHabitColor(color),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : EMPTY_NAME_ERROR,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={(event) => void handleSubmit(event)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="habit-name">Habit name</Label>
        <Input
          id="habit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Morning run"
          maxLength={80}
          autoFocus
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="font-semibold">Schedule</Label>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value === 'specific_days' || value === 'times_per_week') {
              selectMode(value);
            }
          }}
          aria-label="Schedule"
          className="flex flex-wrap gap-2"
        >
          <ToggleGroupItem
            value="specific_days"
            className="min-h-11 px-3"
            aria-label="Specific days"
          >
            Specific days
          </ToggleGroupItem>
          <ToggleGroupItem
            value="times_per_week"
            className="min-h-11 px-3"
            aria-label="Times per week"
          >
            Times per week
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {mode === 'specific_days' ? (
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">Repeat on</Label>
          <ToggleGroup
            type="multiple"
            value={selectedDays.map(String)}
            onValueChange={(values) => {
              setSelectedDays(values.map(Number));
            }}
            aria-label="Repeat on days"
          >
            {DAY_LABELS.map((label, dayIndex) => (
              <ToggleGroupItem
                key={dayIndex}
                value={String(dayIndex)}
                aria-label={label}
                className="min-h-11 min-w-11"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label className="font-semibold">Times per week</Label>
          <ToggleGroup
            type="single"
            value={String(times)}
            onValueChange={(value) => {
              if (!value) return;
              setTimes(Number(value));
            }}
            aria-label="Times per week"
            className="flex flex-wrap gap-2"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <ToggleGroupItem
                key={n}
                value={String(n)}
                aria-label={`${n}`}
                className="min-h-11 min-w-11"
              >
                {n}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label id="habit-color-label" className="font-semibold">
          Color
        </Label>
        <div
          role="radiogroup"
          aria-labelledby="habit-color-label"
          className="flex flex-wrap gap-2"
        >
          {HABIT_COLOR_PRESETS.map((preset) => {
            const selected = color === preset;
            return (
              <button
                key={preset}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Color ${preset}`}
                className={cn(
                  'min-h-11 min-w-11 rounded-full border-2 border-transparent',
                  selected && 'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                )}
                style={{ backgroundColor: preset }}
                onClick={() => setColor(preset)}
              />
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" className="min-h-11 w-full" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
