'use client';

import React, { useState } from 'react';
import { MentorCandidateItem } from '@/lib/api/admin';
import { validateMentorAction } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Check,
  X,
  ShieldCheck,
  FileText,
  ExternalLink,
  Clock,
  Briefcase,
  MapPin,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface MentorsValidationClientProps {
  initialCandidates: MentorCandidateItem[];
}

export function MentorsValidationClient({ initialCandidates }: MentorsValidationClientProps) {
  const [candidates, setCandidates] = useState<MentorCandidateItem[]>(initialCandidates);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');

  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const pendingCount = candidates.filter((c) => c.validationStatus === 'PENDING').length;
  const approvedCount = candidates.filter((c) => c.validationStatus === 'APPROVED').length;

  const filteredCandidates = candidates.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.validationStatus === activeTab;
  });

  const handleValidate = async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    setIsProcessing(true);
    setFeedback(null);

    const res = await validateMentorAction(id, status, reason);
    setIsProcessing(false);

    if (res.success) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, validationStatus: status, rejectionReason: reason } : c))
      );
      setFeedback({ success: true, message: res.message });
      setRejectModal(null);
      setRejectionReason('');
    } else {
      setFeedback({ success: false, message: res.message });
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Onglets de filtrage */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { label: 'En attente de validation', val: 'PENDING', count: pendingCount },
          { label: 'Mentors validés & actifs', val: 'APPROVED', count: approvedCount },
          { label: 'Toutes les candidatures', val: 'ALL', count: candidates.length },
        ].map((tab) => (
          <button
            key={tab.val}
            type="button"
            onClick={() => setActiveTab(tab.val as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.val
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.val ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Modal de refus */}
      {rejectModal && (
        <Card className="border-rose-300 bg-rose-50/50 shadow-md">
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600" />
                Refuser la candidature de {rejectModal.name}
              </h4>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-muted-foreground">
              Indiquez le motif du refus (ce motif sera notifié au candidat pour l'aider à compléter son dossier) :
            </p>

            <Textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex : Expérience insuffisante dans le secteur demandé, justificatifs manquants..."
              className="text-xs bg-background"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModal(null)}
                disabled={isProcessing}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => handleValidate(rejectModal.id, 'REJECTED', rejectionReason)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Traitement...
                  </>
                ) : (
                  'Confirmer le refus'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des candidatures */}
      {filteredCandidates.length > 0 ? (
        <div className="space-y-4">
          {filteredCandidates.map((cand) => {
            const userProfile = cand.user?.profile;
            const mentorName = userProfile?.firstName
              ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
              : cand.user?.email || 'Candidat Mentor';

            return (
              <Card
                key={cand.id}
                className="shadow-xs overflow-hidden border-border hover:border-brand-primary/30 transition-colors"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center shrink-0 text-base">
                        {(mentorName.charAt(0) || 'M').toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">{mentorName}</h3>
                          {cand.validationStatus === 'APPROVED' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Validé & Actif
                            </Badge>
                          ) : cand.validationStatus === 'PENDING' ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" /> En attente de revue
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              Refusé
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Briefcase className="w-3.5 h-3.5 text-brand-primary" />
                            {[cand.jobTitle, cand.organization].filter(Boolean).join(' • ')}
                          </span>
                          {(userProfile?.city || userProfile?.country) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {[userProfile.city, userProfile.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                          {cand.user?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {cand.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-xs font-medium self-start sm:self-auto shrink-0">
                      {cand.yearsOfExperience} ans d'expérience
                    </Badge>
                  </div>

                  {/* Biographie */}
                  <div className="space-y-2 text-xs">
                    <p className="text-foreground/90 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                      {cand.biography}
                    </p>

                    {/* Secteurs & Expertises */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-muted-foreground">Secteurs :</span>
                      {cand.sectors?.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] py-0">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    {cand.expertises && cand.expertises.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted-foreground">Expertises :</span>
                        {cand.expertises.map((exp) => (
                          <Badge key={exp} variant="outline" className="text-[10px] py-0">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions de validation */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                    <div className="flex items-center gap-3">
                      {cand.cvUrl ? (
                        <Button asChild variant="ghost" size="sm" className="text-xs text-brand-primary flex items-center gap-1">
                          <a href={cand.cvUrl} target="_blank" rel="noreferrer">
                            <FileText className="w-3.5 h-3.5" />
                            Consulter le CV
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Dossier soumis le {formatDate(cand.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {cand.validationStatus === 'PENDING' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessing}
                            onClick={() => setRejectModal({ id: cand.id, name: mentorName })}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Refuser
                          </Button>
                          <Button
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleValidate(cand.id, 'APPROVED')}
                            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs h-8 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Valider & Publier
                          </Button>
                        </>
                      ) : cand.validationStatus === 'APPROVED' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() => setRejectModal({ id: cand.id, name: mentorName })}
                          className="text-xs text-muted-foreground hover:text-rose-600 h-8"
                        >
                          Suspendre ce mentor
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isProcessing}
                          onClick={() => handleValidate(cand.id, 'APPROVED')}
                          className="text-xs text-brand-primary h-8"
                        >
                          Réactiver & Valider
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={
            activeTab === 'PENDING'
              ? 'Aucune candidature en attente'
              : 'Aucun profil mentor trouvé'
          }
          description={
            activeTab === 'PENDING'
              ? 'Toutes les candidatures mentors ont été examinées par l’équipe d’administration.'
              : 'Les profils mentors enregistrés dans la base s’afficheront ici.'
          }
          icon={Users}
        />
      )}
    </div>
  );
}

