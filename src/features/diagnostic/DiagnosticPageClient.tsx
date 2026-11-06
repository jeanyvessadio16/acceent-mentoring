'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DiagnosticItem, EligibilityResponse } from '@/lib/api/diagnostics';
import { MatchingResultItem } from '@/lib/api/matching';
import { UserProfileResponse } from '@/lib/api/users';
import { DiagnosticWizard } from './DiagnosticWizard';
import { DiagnosticResultView } from './DiagnosticResultView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, Target } from 'lucide-react';

interface DiagnosticPageClientProps {
  userProfile: UserProfileResponse | null;
  eligibility: EligibilityResponse | null;
  currentDiagnostic: DiagnosticItem | null;
  recommendations: MatchingResultItem[];
}

export function DiagnosticPageClient({
  userProfile,
  eligibility,
  currentDiagnostic,
  recommendations,
}: DiagnosticPageClientProps) {
  const [isRetaking, setIsRetaking] = useState(false);

  // Cas 1 : Le profil utilisateur n'est pas encore éligible (incomplet)
  if (eligibility && !eligibility.canStartDiagnostic && !currentDiagnostic) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-amber-300 bg-linear-to-r from-amber-50 via-orange-50 to-amber-50/60 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-950">
                    Complétez d'abord votre profil pour débloquer le diagnostic
                  </h3>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                    {eligibility.completionPercentage}% complété
                  </Badge>
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Le diagnostic d'orientation utilise vos critères personnels et professionnels pour vous recommander les mentors les plus adaptés. Renseignez les informations manquantes ci-dessous :
                </p>

                {/* Champs manquants */}
                {eligibility.missingFields && eligibility.missingFields.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {eligibility.missingFields.map((field, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-[10px] bg-white/90 text-amber-800 border-amber-300 capitalize"
                      >
                        + {field} manquant
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-amber-200/60">
              <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs shadow-xs">
                <Link href="/beneficiary/profile" className="flex items-center gap-1.5">
                  Compléter mon profil maintenant
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cas 2 : Un diagnostic actif existe déjà et l'utilisateur n'a pas cliqué sur "Refaire"
  if (currentDiagnostic && !isRetaking) {
    return (
      <DiagnosticResultView
        diagnostic={currentDiagnostic}
        recommendations={recommendations}
        onRetake={() => setIsRetaking(true)}
      />
    );
  }

  // Cas 3 : L'utilisateur remplit le diagnostic (première fois ou mise à jour)
  return <DiagnosticWizard userProfile={userProfile} />;
}

