'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { MentorProfile } from '@/types';
import { createMentoringRequestAction } from './actions';

interface MentoringRequestModalProps {
  mentor: MentorProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function MentoringRequestModal({
  mentor,
  isOpen,
  onClose,
}: MentoringRequestModalProps) {
  const [objective, setObjective] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [preferredFormat, setPreferredFormat] = useState<'REMOTE' | 'IN_PERSON' | 'HYBRID'>('REMOTE');
  const [expectedDuration, setExpectedDuration] = useState('3 mois');
  const [expectedFrequency, setExpectedFrequency] = useState('2 sessions par mois');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await createMentoringRequestAction({
        mentorProfileId: mentor.id,
        objective: objective.trim(),
        problemStatement: problemStatement.trim(),
        expectedDuration,
        expectedFrequency,
        preferredFormat,
        message: message.trim() || `Bonjour ${mentor.firstName}, je souhaite solliciter votre accompagnement pour atteindre mes objectifs de carrière.`,
      });

      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <Card className="max-w-lg w-full relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-muted"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold">Demande envoyée !</CardTitle>
            <p className="text-xs text-muted-foreground">
              Votre demande a bien été transmise à <span className="font-semibold text-foreground">{mentor.firstName} {mentor.lastName}</span>.
              Le mentor examinera votre demande et vous recevrez une notification dès sa réponse.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button asChild className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs">
                <Link href="/beneficiary/dashboard">Aller à mon tableau de bord</Link>
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full text-xs">
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">
                Demande d'accompagnement
              </CardTitle>
              <CardDescription className="text-xs">
                Solliciter <span className="font-semibold text-foreground">{mentor.firstName} {mentor.lastName}</span> ({mentor.title})
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3.5 text-xs">
              {errorMessage && (
                <Alert className="border-destructive/50 text-destructive bg-destructive/10">
                  <AlertCircle className="w-4 h-4 text-destructive mr-2" />
                  <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="objective" className="text-xs">
                  Votre objectif principal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="objective"
                  placeholder="ex. Structurer mon business plan pour une levée de fonds"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="problemStatement" className="text-xs">
                  Problématique & Contexte <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="problemStatement"
                  rows={3}
                  placeholder="Expliquez brièvement votre situation actuelle et ce que vous attendez de cet accompagnement..."
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Format souhaité</Label>
                  <select
                    value={preferredFormat}
                    onChange={(e: any) => setPreferredFormat(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden"
                  >
                    <option value="REMOTE">En ligne (Visio)</option>
                    <option value="IN_PERSON">Présentiel</option>
                    <option value="HYBRID">Hybride</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Durée estimée</Label>
                  <select
                    value={expectedDuration}
                    onChange={(e) => setExpectedDuration(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden"
                  >
                    <option value="1 mois">1 mois (Flash)</option>
                    <option value="3 mois">3 mois (Recommandé)</option>
                    <option value="6 mois">6 mois (Long terme)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Fréquence souhaitée</Label>
                  <select
                    value={expectedFrequency}
                    onChange={(e) => setExpectedFrequency(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden"
                  >
                    <option value="1 session par mois">1 session / mois</option>
                    <option value="2 sessions par mois">2 sessions / mois</option>
                    <option value="1 session par semaine">1 session / semaine</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs">
                  Message d'introduction pour le mentor
                </Label>
                <Textarea
                  id="message"
                  rows={2}
                  placeholder="Présentez-vous poliment et dites au mentor pourquoi vous avez choisi son profil..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !objective || !problemStatement}
                className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                <Send className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
