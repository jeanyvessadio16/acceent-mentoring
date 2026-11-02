import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ACCEENT — Plateforme d'Accompagnement, Mentoring et Opportunités",
  description: "Plateforme digitale panafricaine dédiée au mentoring, au développement des compétences, aux réseaux professionnels et aux opportunités de carrière.",
  icons: {
    icon: "/logo/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={cn("h-full antialiased", jakarta.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
