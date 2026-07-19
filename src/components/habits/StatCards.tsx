interface StatCardsProps {
  current: number;
  longest: number;
  rate: number;
  isLoading?: boolean;
}

export function StatCards({ current, longest, rate, isLoading }: StatCardsProps) {
  if (isLoading) {
    return null;
  }

  const items = [
    { label: 'Current', value: String(current) },
    { label: 'Longest', value: String(longest) },
    { label: 'Rate', value: `${rate}%` },
  ];

  return (
    <dl
      className="mt-6 grid grid-cols-3 gap-2 sm:gap-4"
      aria-label="Habit statistics"
    >
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-lg border border-border bg-card p-2 text-center sm:p-3"
        >
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-xl font-semibold text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
