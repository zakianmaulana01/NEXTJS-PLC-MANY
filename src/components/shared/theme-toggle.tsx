"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="relative rounded-full"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="size-4" />
        <Moon className="absolute size-4 scale-0 -rotate-90 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="relative rounded-full"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun
        className={`size-4 transition-all ${
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute size-4 transition-all ${
          isDark ? "scale-100 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
      />
    </Button>
  );
}
