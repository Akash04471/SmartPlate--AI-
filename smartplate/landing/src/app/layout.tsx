import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "SmartPlate — The Last Diet App You'll Ever Need",
  description:
    "The most advanced AI-powered diet management system. Personalized nutrition plans, calorie tracking, and health transformation — powered by intelligent nutrition science.",
  keywords:
    "diet management, nutrition, calorie tracker, meal planning, health, AI diet planner, SmartPlate",
  openGraph: {
    title: "SmartPlate — AI-Powered Nutrition Intelligence",
    description:
      "Transform your health with personalized diet plans, precision calorie tracking, and smart nutrition insights.",
    type: "website",
  },
  themeColor: "#031810",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SmartPlate",
  },
};


import CustomCursor from "@/components/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="antialiased font-body bg-base-dark text-text-primary selection:bg-white/10 overflow-x-hidden">
        <div className="bg-grain" />
        <CustomCursor />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
