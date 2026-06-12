"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl rounded-[2rem] border border-border/70 bg-background/90 p-8 shadow-2xl shadow-black/5 backdrop-blur sm:p-10">
        <div className="mb-6 inline-flex rounded-2xl bg-destructive/10 p-3 text-destructive">
          <TriangleAlert className="size-6" />
        </div>

        <div className="space-y-4">
          <p className="eyebrow">Something broke</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            The page hit an unexpected client-side error.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            The boundary caught the failure so the app can recover gracefully.
            Try the action below, then continue building from a stable baseline.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border/70 bg-muted/40 p-4">
          <p className="text-sm font-medium">Error details</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {error.message || "An unknown error occurred while rendering this route."}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
