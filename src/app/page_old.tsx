import { ArrowRight, Blocks, Layers3, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const pillars = [
  {
    title: "Scalable structure",
    description: "Production-friendly `src/` architecture with clear ownership boundaries.",
    icon: Layers3,
  },
  {
    title: "Reusable UI foundation",
    description: "shadcn/ui primitives, utility-first styling, and a dependable `cn()` helper.",
    icon: Blocks,
  },
  {
    title: "Ready for real work",
    description: "Dark mode, error/loading states, metadata, and sensible defaults out of the box.",
    icon: Sparkles,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border/70" />

      <div className="page-shell relative z-10">
        <header className="flex items-center justify-between gap-4 border-b border-border/60 py-6">
          <div className="space-y-1">
            <p className="eyebrow">Ultimate Starter</p>
            <p className="text-lg font-semibold tracking-tight">Next.js 16 Boilerplate</p>
          </div>

          <ThemeToggle />
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm backdrop-blur">
                App Router + TypeScript + shadcn/ui
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Build once, reuse everywhere, and keep the foundation clean.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  This scaffold gives you a sharp starting point for dashboards,
                  marketing sites, internal tools, and product apps without
                  dragging old project baggage into the next build.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Read docs
                <ArrowRight className="size-4" />
              </a>
              <a
                href="https://ui.shadcn.com/docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-44 items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Explore UI kit
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {pillars.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="mb-2 font-medium tracking-tight">{title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border border-border/70 bg-background/85 shadow-xl shadow-black/5 backdrop-blur">
            <CardHeader>
              <CardTitle>What ships in this scaffold</CardTitle>
              <CardDescription>
                A baseline that feels intentional on day one and stays easy to
                extend on day one hundred.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-sm font-medium">Folder conventions</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    `app`, `components/ui`, `components/shared`, `lib`,
                    `hooks`, `types`, and `context` are separated from the
                    start.
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-sm font-medium">Theme-ready layout</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Root metadata, system-aware dark mode, and a client-safe
                    theme toggle are already wired.
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-sm font-medium">Operational defaults</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Route-level loading, graceful error boundaries, and reusable
                    visual primitives ship as the default baseline.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Start with this foundation, then layer features by domain.
              </p>
              <Button size="lg">Start building</Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
