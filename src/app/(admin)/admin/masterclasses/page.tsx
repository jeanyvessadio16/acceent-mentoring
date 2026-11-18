import type { Metadata } from "next";
import { GraduationCap, Plus, Calendar, Clock, Video, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRealMasterclassesAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "Gestion des Masterclasses | Administration ACCEENT Mentoring",
  description: "Planification et suivi des ateliers collectifs et webinaires d'experts.",
};

export default async function AdminMasterclassesPage() {
  const masterclasses = await getRealMasterclassesAction();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestion des Masterclasses & Ateliers Réels
          </h1>
          <p className="text-sm text-muted-foreground">
            {masterclasses.length} masterclass enregistrée(s) en base de données.
          </p>
        </div>

        <Button className="rounded-full bg-secondary text-white text-xs font-semibold h-10 px-4">
          <Plus className="h-4 w-4 mr-1.5" />
          Planifier une session
        </Button>
      </div>

      {masterclasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Aucune masterclass planifiée pour le moment
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Les sessions collectives et ateliers webinaires apparaîtront ici dès leur planification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterclasses.map((mc: any) => (
            <div
              key={mc.id}
              className="p-5 rounded-2xl bg-white border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                    {mc.categorie}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {mc.statut}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-2">
                  {mc.titre}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>Intervenant : {mc.intervenant}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-muted-foreground">
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
                <span className="font-bold text-primary">
                  {mc.duree} min
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
