import { Suspense } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { AuthenticatedNavbar } from "@/components/navigation/AuthenticatedNavbar";
import { Footer } from "@/components/navigation/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Aller au contenu principal
      </a>
      <Suspense fallback={<Navbar />}>
        <AuthenticatedNavbar />
      </Suspense>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
