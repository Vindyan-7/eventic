export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4 border-b last:border-0">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex justify-between gap-4">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-2.5 bg-muted rounded w-10 shrink-0" />
            </div>
            <div className="h-2.5 bg-muted rounded w-full" />
            <div className="h-2.5 bg-muted rounded w-4/5" />
            <div className="h-4 bg-muted rounded w-16 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
