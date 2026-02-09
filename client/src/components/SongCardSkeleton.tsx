export function SongCardSkeleton() {
  return (
    <div className="ornate-card elegant-shadow">
      <div className="ornate-card-inner p-0">
        {/* Cover placeholder */}
        <div className="aspect-square rounded-t-lg bg-muted animate-pulse" />

        {/* Info placeholder */}
        <div className="p-5 space-y-3">
          <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          <div className="flex items-center justify-between">
            <div className="h-3 bg-muted rounded animate-pulse w-12" />
            <div className="h-5 bg-muted rounded-full animate-pulse w-20" />
          </div>
          <div className="pt-3 border-t border-border/50">
            <div className="h-3 bg-muted rounded animate-pulse w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
