'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface DiagnosticStep {
  title: string;
  question: string;
  options: { label: string; desc: string; value: string }[];
}

const STEPS: DiagnosticStep[] = [
  {
    title: 'Votre situation actuelle',
    question: 'Quelle est votre situation professionnelle principale aujourd’hui ?',
    options: [
      { label: 'Étudiant / Jeune diplômé', desc: 'En fin d’études ou à la recherche d’un premier emploi', value: 'student' },
      { label: 'Porteur de projet / Entrepreneur', desc: 'Création ou développement d’une entreprise ou startup', value: 'entrepreneur' },
      { label: 'Professionnel en poste', desc: 'En transition, reconversion ou accélération de carrière', value: 'professional' },
      { label: 'En recherche d’opportunités', desc: 'En recherche active d’emploi ou de formation', value: 'jobseeker' },
    ],
  },
  {
    title: 'Votre objectif prioritaire',
    question: 'Quel est le résultat clé que vous souhaitez atteindre grâce au mentoring ?',
    options: [
      { label: 'Décrocher un emploi ou un stage', desc: 'Optimisation de CV, entretiens, réseau', value: 'job' },
      { label: 'Structurer et lancer mon projet', desc: 'Modèle économique, stratégie, prototypage', value: 'launch' },
      { label: 'Monter en compétences techniques', desc: 'Apprentissage guidé, bonnes pratiques métiers', value: 'skills' },
      { label: 'Développer mon leadership & réseau', desc: 'Postures managériales et connexions stratégiques', value: 'leadership' },
    ],
  },
  {
    title: 'Secteur d’intérêt',
    question: 'Dans quel secteur souhaitez-vous être accompagné en priorité ?',
    options: [
      { label: 'Technologies & Intelligence Artificielle', desc: 'Développement, data, produit, cybersécurité', value: 'tech' },
      { label: 'Business & Entrepreneuriat', desc: 'Financement, vente, stratégie commerciale', value: 'business' },
      { label: 'Finance & Fintech', desc: 'Banque, comptabilité, inclusion financière', value: 'finance' },
      { label: 'Impact social, Agri & Santé', desc: 'Développement durable, agrobusiness, santé', value: 'impact' },
    ],
  },
];

export function DiagnosticWizard() {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = React.useState(false);

  const step = STEPS[currentStepIndex];
  const selectedAnswer = answers[currentStepIndex];

  const handleSelectOption = (value: string) => {
    setAnswers({ ...answers, [currentStepIndex]: value });
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto shadow-md border-brand-primary/30">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Diagnostic complété avec succès !
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Nos algorithmes ont analysé votre profil et identifié des mentors adaptés à vos objectifs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-center">
          <div className="p-4 rounded-xl bg-secondary border border-border text-left space-y-2">
            <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Vos recommandations personnalisées</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sur la base de vos réponses, nous vous conseillons un accompagnement ciblé avec des mentors spécialisés dans votre secteur.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild className="bg-brand-primary hover:bg-brand-secondary text-white">
            <Link href="/beneficiary/mentors">
              Consulter les mentors recommandés
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/beneficiary/dashboard">Aller à mon tableau de bord</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between text-xs font-semibold text-brand-primary mb-1">
          <span>Étape {currentStepIndex + 1} sur {STEPS.length}</span>
          <span>{Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-brand-primary h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <CardTitle className="text-xl font-bold text-foreground">{step.title}</CardTitle>
        <CardDescription className="text-sm text-foreground/80 font-medium">
          {step.question}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {step.options.map((option) => {
          const isSelected = selectedAnswer === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelectOption(option.value)}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                  : 'border-border hover:bg-secondary/60'
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-border'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Précédent
        </Button>

        <Button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
        >
          {currentStepIndex === STEPS.length - 1 ? 'Voir mes résultats' : 'Suivant'}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

