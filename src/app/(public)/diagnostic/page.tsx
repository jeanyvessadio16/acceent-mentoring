import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DiagnosticWizard } from '@/features/diagnostic/DiagnosticWizard';
import { Compass } from 'lucide-react';

export default function DiagnosticPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-brand-primary text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Orientation Personnalisée</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Diagnostic de compétences et d'objectifs
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            En moins de 3 minutes, clarifiez votre besoin prioritaire et obtenez des recommandations de mentors adaptées à votre profil.
          </p>
        </div>

        <DiagnosticWizard />
      </main>

      <Footer />
    </div>
  );
}

