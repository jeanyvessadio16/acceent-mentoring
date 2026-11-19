import type { Metadata } from "next";
import { GraduationCap, Calendar, Clock, User, Video } from "lucide-react";
import { getBeneficiaryMasterclassesAction } from "@/lib/actions/beneficiary";

export const metadata: Metadata = {
  title: "Masterclasses & Webinaires | Espace Bénéficiaire ACCEENT Mentoring",
  description: "Ateliers thématiques collectifs et replays animés par les experts ACCEENT.",
};

export default async function BeneficiaryMasterclassesPage() {
  const masterclasses = await getBeneficiaryMasterclassesAction();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-secondary" />
          Masterclasses &amp; Ateliers Collectifs
        </h1>
        <p className="text-sm text-muted-foreground">
          {masterclasses.length} session(s) disponible(s) pour développer vos compétences transversales.
        </p>
      </div>

      {masterclasses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Aucune masterclass programmée pour le moment
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Les prochains webinaires en direct et ateliers en replay apparaîtront ici dès leur planification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterclasses.map((mc) => {
            const actionUrl = mc.statut === "COMPLETED" ? mc.lienReplay : mc.lienLive;

            return (
              <div
                key={mc.id}
                className="p-5 rounded-3xl bg-white border border-border shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                      {mc.categorie}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {mc.statut}
                    </span>
                  </div>

                  <h2 className="font-bold text-sm text-foreground line-clamp-2">
                    {mc.titre}
                  </h2>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>Intervenant : {mc.intervenant}</span>
                  </p>

                  {mc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {mc.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {mc.dateSession
                        ? new Date(mc.dateSession).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {mc.duree} min
                    </span>
                  </div>

                  {actionUrl && (
                    <a
                      href={actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-secondary hover:bg-secondary/90 transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>
                        {mc.statut === "COMPLETED" ? "Voir le replay" : "Accéder au direct"}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
