"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MentorshipRequestFormClient } from "./MentorshipRequestFormClient";

interface MentorshipRequestButtonProps {
  mentorId: string;
  mentorName: string;
  isAvailable?: boolean;
}

export function MentorshipRequestButton({
  mentorId,
  mentorName,
  isAvailable = true,
}: MentorshipRequestButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          disabled={!isAvailable}
          className="rounded-full px-5"
        >
          <Send className="h-4 w-4 mr-2" />
          Demander un mentorat
        </Button>
        <Link
          href={`/beneficiary/request/${mentorId}`}
          className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-semibold border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
        >
          Formulaire dédié
        </Link>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-modal-title"
        >
          <div className="bg-white rounded-3xl border border-border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2
                  id="request-modal-title"
                  className="text-lg font-bold text-foreground"
                >
                  Demander un accompagnement à {mentorName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Complétez votre besoin pour que le mentor puisse évaluer et
                  lancer votre parcours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="p-1.5 rounded-full text-muted-foreground hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <MentorshipRequestFormClient
              mentorId={mentorId}
              mentorName={mentorName}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
