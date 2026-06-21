import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const calSans = localFont({
  src: "../fonts/CalSansUI.woff2",
  variable: "--font-cal-sans-ui",
  weight: "300 700",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Simple Resume - Free Modern Resume Builder",
  description:
    "Create a professional ATS-friendly PDF resume in minutes. Six curated single-column layouts—download instantly.",
  keywords: ["resume builder", "free resume maker", "ATS resume", "cv maker", "professional resume", "pdf resume"],
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
      className={`${calSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-[100dvh] min-h-screen overflow-x-clip bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
