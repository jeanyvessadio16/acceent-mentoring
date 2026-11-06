'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Save,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  Star,
  ToggleLeft,
  ToggleRight,
  Briefcase,
  Building,
} from 'lucide-react';
import { upsertMentorProfileAction, toggleMentorAvailabilityAction } from './actions';

interface MentorProfileFormProps {
  user: any;
  mentorProfile: any;
}

const COMMON_SECTORS = [
  'Numérique, Tech & IA',
  'Agrobusiness & Agroalimentaire',
  'Entrepreneuriat & Création d\'entreprise',
  'Finance, Banque & Fintech',
  'Santé, Médical & Pharmacie',
  'Énergie, Environnement & Climat',
  'Commerce, Vente & Distribution',
  'Éducation & Formation',
];

export function MentorProfileForm({ user, mentorProfile }: MentorProfileFormProps) {
  const [jobTitle, setJobTitle] = useState(mentorProfile?.jobTitle || '');
  const [organization, setOrganization] = useState(mentorProfile?.organization || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(
    mentorProfile?.yearsOfExperience ?? 5
  );
  const [biography, setBiography] = useState(mentorProfile?.biography || '');
  const [sectors, setSectors] = useState<string[]>(mentorProfile?.sectors || ['Numérique, Tech & IA']);
  const [expertises, setExpertises] = useState<string[]>(
    mentorProfile?.expertises || ['Conseil stratégique', 'Gestion de projet']
  );
  const [newExpertiseInput, setNewExpertiseInput] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(mentorProfile?.isAvailable ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const validationStatus = mentorProfile?.validationStatus || 'PENDING';
  const averageRating = mentorProfile?.averageRating ?? 5.0;

  const addSector = (sec: string) => {
    if (!sectors.includes(sec)) {
      setSectors((prev) => [...prev, sec]);
    }
  };

  const removeSector = (sec: string) => {
    if (sectors.length > 1) {
      setSectors((prev) => prev.filter((s) => s !== sec));
    }
  };

  const addExpertise = () => {
    const trimmed = newExpertiseInput.trim();
    if (trimmed && !expertises.includes(trimmed)) {
      setExpertises((prev) => [...prev, trimmed]);
      setNewExpertiseInput('');
    }
  };

  const removeExpertise = (exp: string) => {
    if (expertises.length > 1) {
      setExpertises((prev) => prev.filter((e) => e !== exp));
    }
  };

  const handleToggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    const res = await toggleMentorAvailabilityAction(newStatus);
    setFeedback({ success: res.success, message: res.message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await upsertMentorProfileAction({
      jobTitle: jobTitle.trim(),
      organization: organization.trim(),
      yearsOfExperience: Number(yearsOfExperience) || 0,
      biography: biography.trim(),
      sectors,
      expertises,
      languages: mentorProfile?.languages || ['Français'],
      targetAudiences: mentorProfile?.targetAudiences || ['Jeunes entrepreneurs', 'Femmes'],
      mentoringTypes: mentorProfile?.mentoringTypes || ['INDIVIDUAL'],
    });

    setIsSubmitting(false);
    setFeedback({ success: res.success, message: res.message });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {feedback && (
        <Alert
          className={
            feedback.success
              ? 'border-emerald-500/50 text-emerald-800 bg-emerald-50'
              : 'border-destructive/50 text-destructive bg-destructive/10'
          }
        >
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive mr-2" />
          )}
          <AlertDescription className="text-xs font-medium">{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Carte Statut & Validation */}
      <Card className="shadow-xs border-brand-primary/20 bg-linear-to-r from-brand-primary/5 via-transparent to-transparent">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}
              </h3>
              {validationStatus === 'APPROVED' ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Profil Vérifié
                </Badge>
              ) : validationStatus === 'PENDING' ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1 text-[10px]">
                  <Clock className="w-3 h-3 text-amber-600" /> Validation en cours
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px]">
                  Non validé
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{Number(averageRating).toFixed(1)} / 5</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleAvailability}
              className={`text-xs flex items-center gap-1.5 ${
                isAvailable ? 'text-emerald-700 border-emerald-300 bg-emerald-50/50' : 'text-muted-foreground'
              }`}
            >
              {isAvailable ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Disponible pour mentorat
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Disponibilité suspendue
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire des données professionnelles */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-primary" />
            Fiche Expert / Mentor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle" className="text-xs font-semibold">
                Titre / Rôle actuel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex : Lead Architect, Directeur Général..."
                required
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="organization" className="text-xs font-semibold">
                Entreprise / Organisation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Ex : KeurTech, Sonatel, Cabinet X..."
                required
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yearsOfExperience" className="text-xs font-semibold">
              Années d'expérience professionnelle <span className="text-destructive">*</span>
            </Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min="0"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="biography" className="text-xs font-semibold">
              Biographie publique & Approche de mentorat <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="biography"
              rows={4}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Présentez votre parcours, vos réalisations et ce que vous apportez à vos mentorés..."
              required
              className="text-xs"
            />
          </div>

          {/* Secteurs d'intervention */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Label className="text-xs font-semibold block">Secteurs d'intervention :</Label>
            <div className="flex flex-wrap gap-1.5">
              {sectors.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-xs font-medium border border-brand-primary/20"
                >
                  {s}
                  <button type="button" onClick={() => removeSector(s)}>
                    <X className="w-3 h-3 hover:text-destructive" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_SECTORS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => addSector(sec)}
                  className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                    sectors.includes(sec)
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-muted/40 hover:bg-muted text-foreground border-border'
                  }`}
                >
                  + {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Expertises précises */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Label className="text-xs font-semibold block">Domaines d'expertise précis :</Label>
            <div className="flex flex-wrap gap-1.5">
              {expertises.map((exp) => (
                <span
                  key={exp}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs border border-border"
                >
                  {exp}
                  <button type="button" onClick={() => removeExpertise(exp)}>
                    <X className="w-3 h-3 hover:text-destructive" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newExpertiseInput}
                onChange={(e) => setNewExpertiseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExpertise();
                  }
                }}
                placeholder="Ajouter une expertise (ex : Microservices, Levée de fonds)..."
                className="text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={addExpertise} className="shrink-0 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-3 border-t border-border">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSubmitting ? 'Enregistrement...' : 'Mettre à jour mon profil'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

