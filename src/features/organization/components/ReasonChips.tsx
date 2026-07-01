export function ReasonChips({ reasons }: { reasons: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {reasons.map((reason, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-fluent-accent/8 dark:bg-fluent-accent/15 text-fluent-accent dark:text-fluent-accent-light border border-fluent-accent/20"
        >
          {reason}
        </span>
      ))}
    </div>
  )
}
