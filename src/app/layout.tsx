import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ScadaThemeProvider } from "@/context/ThemeContext";

import "./globals.css";
import "./scada.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SCADA Compressor Dashboard",
    template: "%s | SCADA Dashboard",
  },
  description:
    "Industrial Compressed Air SCADA system telemetry and monitoring dashboard.",
  applicationName: "SCADA Compressor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ScadaThemeProvider>
            {children}
          </ScadaThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
