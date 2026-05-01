export function AuthSeparator() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-widest">
        <span className="bg-background px-2 text-muted-foreground font-medium">
          Or
        </span>
      </div>
    </div>
  );
}
