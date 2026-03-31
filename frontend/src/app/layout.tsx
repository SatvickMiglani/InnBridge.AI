import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DashboardLayout } from "@/components/dashboard-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InnoBridge AI — Your Innovation Feed",
  description: "AI-curated feed of research papers, trending dev discussions, and open-source projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col selection:bg-primary/30 text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="ambient-light" />
          <DashboardLayout>{children}</DashboardLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
