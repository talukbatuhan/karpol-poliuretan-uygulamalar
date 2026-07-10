export function ToolSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-120px)] min-h-[480px] items-center justify-center bg-ivory-100">
      <p className="font-mono text-xs uppercase tracking-widest text-navy-800/60">
        Yükleniyor…
      </p>
    </div>
  );
}
