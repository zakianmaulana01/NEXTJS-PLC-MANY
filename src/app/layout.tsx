import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppThemeProvider } from "@/context/ThemeContext";
import DisableBackButton from "@/components/DisableBackButton";

import "./globals.css";
import "./monitoring.css";

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
    default: "PLC Compressor Dashboard",
    template: "%s | Dashboard",
  },
  description:
    "Industrial Compressed Air system telemetry and monitoring dashboard.",
  applicationName: "PLC Compressor",
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
        <DisableBackButton />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppThemeProvider>
            <div className="flex h-screen w-screen overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
              </div>
            </div>
          </AppThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
