"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
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

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="relative rounded-full"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
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
