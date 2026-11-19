import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Inbox, Mail, Clock } from "lucide-react";
import { getMentorWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Demandes Reçues | Espace Mentor ACCEENT Mentoring",
  description: "Consultez les demandes d'accompagnement formulées par les bénéficiaires.",
};

export default async function MentorRequestsPage() {
  const data = await getMentorWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Inbox className="h-6 w-6 text-primary" />
          Demandes de Mentoring Reçues
        </h1>
        <p className="text-sm text-muted-foreground">
          {data.requests.length} demande(s) enregistrée(s), dont {data.pendingRequestsCount} en attente de réponse.
        </p>
      </div>

      {data.requests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucune demande de mentoring reçue
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Les sollicitations envoyées par les bénéficiaires après leur diagnostic apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-6 border border-border shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-bold text-foreground">{req.menteeName}</h2>
                  {req.menteeEmail && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {req.menteeEmail}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 self-start sm:self-center">
                  {req.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground font-medium block">Objectif :</span>
                  <p className="font-semibold text-foreground">{req.objectif}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">Modalités :</span>
                  <p className="font-semibold text-foreground">
                    {req.format} · {req.frequence} ({req.duree})
                  </p>
                </div>
              </div>

              {req.message && (
                <p className="text-xs text-muted-foreground bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {req.message}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                <span>
                  Reçue le {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
