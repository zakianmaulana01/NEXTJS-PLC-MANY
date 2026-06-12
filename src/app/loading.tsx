export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="page-shell py-10">
        <div className="mb-10 flex items-center justify-between border-b border-border/60 pb-6">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-52 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-5">
            <div className="h-4 w-44 animate-pulse rounded-full bg-muted" />
            <div className="space-y-3">
              <div className="h-14 w-full animate-pulse rounded-3xl bg-muted" />
              <div className="h-14 w-11/12 animate-pulse rounded-3xl bg-muted" />
            </div>
            <div className="h-6 w-3/4 animate-pulse rounded-full bg-muted" />

            <div className="flex gap-3">
              <div className="h-11 w-36 animate-pulse rounded-full bg-primary/20" />
              <div className="h-11 w-36 animate-pulse rounded-full bg-muted" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
                  <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
                  <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-background/85 p-6 shadow-xl shadow-black/5">
            <div className="flex items-center gap-3">
              <div className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <div>
                <p className="font-medium tracking-tight">Preparing your workspace</p>
                <p className="text-sm text-muted-foreground">
                  Loading the boilerplate surface and reusable UI shell.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-muted/70"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
