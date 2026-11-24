"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import type { PendingValidationItem } from "@/types";
import { updateUserStatusAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

interface PendingValidationsTableProps {
  initialItems: PendingValidationItem[];
  showViewAll?: boolean;
}

export function PendingValidationsTable({
  initialItems,
  showViewAll = true,
}: PendingValidationsTableProps) {
  const [items, setItems] = useState<PendingValidationItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setProcessingId(id);
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await updateUserStatusAction(id, action);
        if (result.success) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          setFeedback({
            type: "success",
            message: result.message,
          });
        } else {
          setFeedback({
            type: "error",
            message: "Impossible de mettre à jour le statut.",
          });
        }
      } catch {
        setFeedback({
          type: "error",
          message: "Une erreur réseau est survenue.",
        });
      } finally {
        setProcessingId(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
      {/* En-tête de la carte */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Validations de comptes en attente
            </h3>
            {items.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-accent/20 text-accent border border-accent/30">
                {items.length} à traiter
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Validation administrative obligatoire avant activation du profil public
          </p>
        </div>

        {showViewAll && items.length > 0 && (
          <Link
            href={ROUTES.ADMIN.VALIDATIONS}
            className="text-xs font-semibold text-secondary hover:text-secondary/80 flex items-center gap-1 transition-colors"
          >
            <span>Voir toute la file</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Message de notification */}
      {feedback && (
        <div
          role="alert"
          className={`mx-5 my-3 p-3 rounded-xl text-xs flex items-center justify-between ${feedback.type === "success"
            ? "bg-success/10 text-success border border-success/20"
            : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground font-bold ml-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Table / Liste des dossiers */}
      {items.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            Tous les dossiers sont à jour !
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Aucune candidature en attente de validation administrative pour le moment.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => {
            const isItemProcessing = isPending && processingId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Infos Candidat */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {item.firstName} {item.lastName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        item.role === "mentor"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : item.role === "partner"
                          ? "bg-teal-100 text-teal-800 border border-teal-200"
                          : "bg-purple-100 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {item.role === "mentor"
                        ? "Mentor"
                        : item.role === "partner"
                        ? "Partenaire"
                        : "Expert"}
                    </span>
                    <span className="text-xs text-muted-foreground">· {item.email}</span>
                  </div>

                  <p className="text-xs text-foreground/85 font-medium flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>
                      {item.title} {item.organization ? `· ${item.organization}` : ""}{" "}
                      {item.role !== "partner" && (
                        <span className="text-muted-foreground">({item.yearsOfExperience} ans d&apos;exp.)</span>
                      )}
                      {item.mentoringFormat ? (
                        <span className="text-muted-foreground"> · Format : {item.mentoringFormat}</span>
                      ) : null}
                    </span>
                  </p>

                  {item.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.bio}
                    </p>
                  )}

                  {/* Badges d'expertises, secteurs et pièces du dossier */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {item.sectors?.map((sec, idx) => (
                      <span
                        key={`sec-${idx}`}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/10 text-secondary font-medium"
                      >
                        {sec}
                      </span>
                    ))}
                    {item.expertises.map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700"
                      >
                        {exp}
                      </span>
                    ))}
                    <span className="text-[11px] text-muted-foreground ml-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.submittedAt}
                    </span>
                  </div>

                  {(() => {
                    const safeCvUrl = sanitizeExternalUrl(item.cvUrl);
                    const safeLinkedinUrl = sanitizeExternalUrl(item.linkedinUrl);
                    if (!safeCvUrl && !safeLinkedinUrl) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {safeCvUrl && (
                          <a
                            href={safeCvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Voir le CV (PDF)</span>
                          </a>
                        )}
                        {safeLinkedinUrl && (
                          <a
                            href={safeLinkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            <span>LinkedIn</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Boutons d'Action (Server Action directe) */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isItemProcessing}
                    onClick={() => handleAction(item.id, "rejected")}
                    className="h-9 rounded-full text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  >
                    {isItemProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 mr-1 text-destructive" />
                    )}
                    Rejeter
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    disabled={isItemProcessing}
                    onClick={() => handleAction(item.id, "approved")}
                    className="h-9 rounded-full text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 shadow-xs"
                  >
                    {isItemProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    )}
                    Approuver
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
