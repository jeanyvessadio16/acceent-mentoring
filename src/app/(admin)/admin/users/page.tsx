import type { Metadata } from "next";
import { Users, Search, Filter, ShieldCheck, Mail, MapPin, UserPlus } from "lucide-react";
import { getAdminStatsAction, getRealUsersListAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "Gestion des Utilisateurs | Administration ACCEENT Mentoring",
  description: "Annuaire et gestion des comptes réels de la plateforme.",
};

export default async function AdminUsersPage() {
  const [stats, realUsers] = await Promise.all([
    getAdminStatsAction(),
    getRealUsersListAction(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Annuaire des Utilisateurs Réels
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.totalUsers} compte(s) enregistré(s) en base de données ({stats.totalBeneficiaries} bénéficiaire(s), {stats.totalMentors} mentor(s)).
          </p>
        </div>
      </div>

      {/* Barre de filtre & recherche */}
      <div className="p-4 rounded-xl bg-white border border-border shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, ville..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-medium text-muted-foreground">Filtrer par rôle :</span>
          <select className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white text-foreground focus:outline-none">
            <option>Tous les rôles</option>
            <option>Bénéficiaires</option>
            <option>Mentors</option>
            <option>Experts</option>
            <option>Partenaires</option>
            <option>Administrateurs</option>
          </select>
        </div>
      </div>

      {/* Table des utilisateurs réels */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        {realUsers.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Aucun utilisateur trouvé en base de données
            </h4>
            <p className="text-xs text-muted-foreground">
              Les nouveaux utilisateurs inscrits apparaîtront automatiquement ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Utilisateur</th>
                  <th className="px-4 py-3.5">Rôle</th>
                  <th className="px-4 py-3.5">Démographie</th>
                  <th className="px-4 py-3.5">Résidence & Pays</th>
                  <th className="px-4 py-3.5">Statut Compte</th>
                  <th className="px-4 py-3.5">Date Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {realUsers.map((user) => {
                  const dateStr = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        <p className="font-bold text-sm text-foreground">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        {user.telephone && (
                          <p className="text-[11px] text-slate-400">{user.telephone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-accent/20 text-accent-foreground border border-accent/30 font-bold"
                              : user.role === "MENTOR"
                              ? "bg-secondary/15 text-secondary border border-secondary/30"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <span>{user.sexe || "Non renseigné"}</span>
                        {user.age ? ` · ${user.age} ans` : ""}
                        {user.situationHandicap && (
                          <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
                            Handicap déclaré (SDH)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {user.milieuResidence || "Non renseigné"}
                        </span>
                        <span className="text-[11px] text-slate-400">{user.pays}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            user.statutCompte === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : user.statutCompte === "PENDING"
                              ? "bg-accent/20 text-amber-800"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.statutCompte === "ACTIVE"
                                ? "bg-emerald-500"
                                : user.statutCompte === "PENDING"
                                ? "bg-accent"
                                : "bg-destructive"
                            }`}
                          />
                          {user.statutCompte}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
