export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted/50 w-fit border border-border/50">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-[bounce_1s_infinite_0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-[bounce_1s_infinite_200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-[bounce_1s_infinite_400ms]" />
      </div>
      <span className="text-xs font-medium text-muted-foreground animate-pulse tracking-tight">
        BindAI está processando...
      </span>
    </div>
  )
}