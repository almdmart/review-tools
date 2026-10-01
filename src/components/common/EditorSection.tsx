export function EditorSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-b border-border pb-5 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
