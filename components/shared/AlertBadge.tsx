export function AlertBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-red px-3 py-1 text-sm font-semibold text-brand-white">
      {children}
    </span>
  );
}
