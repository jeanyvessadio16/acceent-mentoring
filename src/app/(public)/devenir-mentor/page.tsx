'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, HeartHandshake, Award, Users, ArrowRight } from 'lucide-react';

export default function DevenirMentorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="py-16 sm:py-24 bg-brand-surface border-b border-border text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 text-xs font-semibold">
              Rejoindre l'Alliance des Mentors
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Partagez votre expertise, formez la prochaine génération
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Devenez mentor ou expert sur ACCEENT pour accompagner des jeunes diplômés, professionnels et entrepreneurs ambitieux à travers l’Afrique.
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-secondary text-white font-semibold">
                <Link href="/register">
                  Déposer ma candidature
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            Pourquoi devenir mentor sur ACCEENT ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Impact direct & mesurable</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aidez des porteurs de projets et des talents à franchir des étapes décisives et mesurez les résultats concrets de votre accompagnement.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Réseau d'experts panafricain</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Échangez avec d'autres mentors, directeurs généraux, investisseurs et acteurs clés de l'écosystème d'Afrique de l'Ouest et des diasporas.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">Processus cadré et flexible</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Vous définissez vous-même vos disponibilités, le nombre de mentorés acceptés et le format de vos échanges via notre plateforme.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

