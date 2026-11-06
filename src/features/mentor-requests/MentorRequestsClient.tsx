'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MentoringRequestItem } from '@/lib/api/requests';
import { decideMentoringRequestAction } from '@/features/mentoring-requests/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Check,
  X,
  MessageSquare,
  Clock,
  MapPin,
  Briefcase,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  HelpCircle,
  ArrowRight,
  Users,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

interface MentorRequestsClientProps {
  initialRequests: MentoringRequestItem[];
}

export function MentorRequestsClient({ initialRequests }: MentorRequestsClientProps) {
  const [requests, setRequests] = useState<MentoringRequestItem[]>(initialRequests);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  // État de modal / dialogue pour message d'acceptation, rejet ou précision
  const [decisionModal, setDecisionModal] = useState<{
    requestId: string;
    type: 'ACCEPTED' | 'REJECTED' | 'NEEDS_CLARIFICATION';
    beneficiaryName: string;
  } | null>(null);

  const [responseMessage, setResponseMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Filtrage
  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const acceptedCount = requests.filter((r) => r.status === 'ACCEPTED').length;

  const handleOpenDecision = (
    requestId: string,
    type: 'ACCEPTED' | 'REJECTED' | 'NEEDS_CLARIFICATION',
    beneficiaryName: string
  ) => {
    setDecisionModal({ requestId, type, beneficiaryName });
    setResponseMessage(
      type === 'ACCEPTED'
        ? 'Je serai ravi(e) de vous accompagner pour atteindre cet objectif.'
        : ''
    );
    setFeedback(null);
  };

  const handleSubmitDecision = async () => {
    if (!decisionModal) return;
    setIsPending(true);
    setFeedback(null);

    const res = await decideMentoringRequestAction(decisionModal.requestId, {
      decision: decisionModal.type,
      mentorResponse: responseMessage.trim() || undefined,
      clarificationNote:
        decisionModal.type === 'NEEDS_CLARIFICATION' ? responseMessage.trim() : undefined,
    });

    setIsPending(false);

    if (res.success) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === decisionModal.requestId
            ? {
                ...r,
                status: decisionModal.type,
                mentorResponse: responseMessage.trim() || null,
              }
            : r
        )
      );
      setFeedback({ success: true, message: res.message });
      setDecisionModal(null);
    } else {
      setFeedback({ success: false, message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications d'action */}
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

      {/* Onglets de filtres */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { label: 'En attente de réponse', val: 'PENDING', count: pendingCount },
          { label: 'Accompagnements acceptés', val: 'ACCEPTED', count: acceptedCount },
          { label: 'Toutes les demandes', val: 'ALL', count: requests.length },
        ].map((tab) => (
          <button
            key={tab.val}
            type="button"
            onClick={() => setActiveFilter(tab.val as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeFilter === tab.val
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.val
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Boîte de dialogue de décision */}
      {decisionModal && (
        <Card className="border-brand-primary/40 bg-brand-primary/5 shadow-md">
          <CardContent className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                {decisionModal.type === 'ACCEPTED' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Accepter l'accompagnement de {decisionModal.beneficiaryName}
                  </>
                ) : decisionModal.type === 'REJECTED' ? (
                  <>
                    <X className="w-4 h-4 text-rose-600" />
                    Décliner la demande de {decisionModal.beneficiaryName}
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Demander des précisions à {decisionModal.beneficiaryName}
                  </>
                )}
              </h4>
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {decisionModal.type === 'ACCEPTED'
                ? 'Un parcours de mentorat officiel et un salon de messagerie directe seront créés. Vous pouvez ajouter un message de bienvenue pour le premier contact :'
                : decisionModal.type === 'REJECTED'
                ? 'Vous pouvez indiquer un motif bienveillant ou des conseils d’orientation pour aider le candidat :'
                : 'Indiquez les éléments que vous souhaitez que le bénéficiaire précise avant de valider sa demande :'}
            </p>

            <Textarea
              rows={3}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Votre message..."
              className="text-xs bg-background"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDecisionModal(null)}
                disabled={isPending}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={handleSubmitDecision}
                className={`text-white text-xs ${
                  decisionModal.type === 'ACCEPTED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : decisionModal.type === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Enregistrement...
                  </>
                ) : decisionModal.type === 'ACCEPTED' ? (
                  'Confirmer l’accompagnement'
                ) : decisionModal.type === 'REJECTED' ? (
                  'Confirmer le refus'
                ) : (
                  'Envoyer la demande de précisions'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des demandes */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const benProfile = req.beneficiary?.profile;
            const benName = benProfile?.firstName
              ? `${benProfile.firstName} ${benProfile.lastName || ''}`.trim()
              : 'Bénéficiaire ACCEENT';

            return (
              <Card key={req.id} className="shadow-xs overflow-hidden border-border hover:border-brand-primary/30 transition-colors">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Entête candidat */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center shrink-0 text-sm">
                        {(benName.charAt(0) || 'B').toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">{benName}</h3>
                          {req.status === 'PENDING' ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                              En attente
                            </Badge>
                          ) : req.status === 'ACCEPTED' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                              Acceptée
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">
                              Déclinée
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {req.beneficiary?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {req.beneficiary.email}
                            </span>
                          )}
                          {(benProfile?.city || benProfile?.country) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {[benProfile.city, benProfile.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(req.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Format et durée */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        Durée : {req.expectedDuration}
                      </Badge>
                      <Badge className="bg-brand-primary/10 text-brand-primary text-xs border-none">
                        {req.preferredFormat === 'REMOTE' ? 'À distance' : req.preferredFormat === 'IN_PERSON' ? 'Présentiel' : 'Hybride'}
                      </Badge>
                    </div>
                  </div>

                  {/* Parcours du candidat si présent */}
                  {(benProfile?.currentTitle || benProfile?.organization || benProfile?.sector) && (
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs flex flex-wrap items-center gap-3">
                      {benProfile?.sector && (
                        <span className="font-semibold text-brand-primary">
                          Secteur : {benProfile.sector}
                        </span>
                      )}
                      {(benProfile.currentTitle || benProfile.organization) && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {[benProfile.currentTitle, benProfile.organization].filter(Boolean).join(' chez ')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contenu de la demande */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-foreground block mb-0.5">
                        Objectif formulé :
                      </span>
                      <p className="text-foreground/90 font-medium bg-background p-2.5 rounded border border-border">
                        {req.objective}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-muted-foreground block mb-0.5">
                        Détail du besoin & Problématique :
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        {req.problemStatement}
                      </p>
                    </div>

                    {req.message && req.message !== req.problemStatement && (
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-0.5">
                          Message personnalisé du candidat :
                        </span>
                        <p className="text-muted-foreground italic bg-muted/20 p-2.5 rounded border border-border/60">
                          « {req.message} »
                        </p>
                      </div>
                    )}

                    {/* Réponse du mentor si déjà donnée */}
                    {req.mentorResponse && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                        <span className="font-semibold block mb-0.5">Votre réponse transmise :</span>
                        <p className="italic">« {req.mentorResponse} »</p>
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground">
                      Fréquence souhaitée : <strong>{req.expectedFrequency}</strong>
                    </span>

                    {req.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDecision(req.id, 'REJECTED', benName)}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Décliner
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDecision(req.id, 'NEEDS_CLARIFICATION', benName)}
                          className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                        >
                          <HelpCircle className="w-3.5 h-3.5 mr-1" />
                          Précisions
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenDecision(req.id, 'ACCEPTED', benName)}
                          className="bg-brand-primary hover:bg-brand-secondary text-white text-xs shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Accepter l'accompagnement
                        </Button>
                      </div>
                    ) : req.status === 'ACCEPTED' ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs py-1 px-2.5">
                          ✓ Accompagnement en cours
                        </Badge>
                        <Button asChild size="sm" variant="outline" className="text-xs">
                          <Link href="/mentor/journey" className="flex items-center gap-1">
                            Voir le parcours
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-xs py-1 px-2.5">
                        Demande déclinée
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={
            activeFilter === 'PENDING'
              ? 'Aucune demande en attente'
              : activeFilter === 'ACCEPTED'
              ? 'Aucun accompagnement actif'
              : 'Aucune demande de mentorat'
          }
          description={
            activeFilter === 'PENDING'
              ? 'Vous êtes à jour dans le traitement de vos demandes. Les nouvelles sollicitations apparaîtront ici dès qu’un bénéficiaire vous contacte.'
              : 'Toutes vos demandes traitées apparaîtront dans cette liste.'
          }
          icon={Users}
        />
      )}
    </div>
  );
}
