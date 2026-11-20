"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  X,
  Loader2,
  RefreshCw,
  HeartHandshake,
  UserCheck,
  UserX,
  Check,
} from "lucide-react";
import type { RealDatabaseUser } from "@/lib/actions/admin";
import { updateUserStatusAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface AdminUsersTableProps {
  initialUsers: RealDatabaseUser[];
}

export function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [users, setUsers] = useState<RealDatabaseUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedInclusion, setSelectedInclusion] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<RealDatabaseUser | null>(null);

  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Statistiques dérivées
  const stats = useMemo(() => {
    return {
      total: users.length,
      beneficiaries: users.filter((u) => u.role === "BENEFICIAIRE").length,
      mentors: users.filter((u) => u.role === "MENTOR").length,
      experts: users.filter((u) => u.role === "EXPERT").length,
      partners: users.filter((u) => u.role === "PARTENAIRE").length,
      pending: users.filter((u) => u.statutCompte === "PENDING").length,
      active: users.filter((u) => u.statutCompte === "ACTIVE").length,
      sdh: users.filter((u) => u.situationHandicap).length,
      females: users.filter((u) => u.sexe === "FEMME").length,
      rural: users.filter((u) => u.milieuResidence === "RURAL").length,
    };
  }, [users]);

  // Filtrage combiné
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Recherche textuelle
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const fullName = `${u.prenom || ""} ${u.nom || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.telephone || "").toLowerCase();
        const country = (u.pays || "").toLowerCase();
        const residence = (u.milieuResidence || "").toLowerCase();

        const matches =
          fullName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          country.includes(query) ||
          residence.includes(query);

        if (!matches) return false;
      }

      // 2. Filtre rôle
      if (selectedRole !== "ALL" && u.role !== selectedRole) {
        return false;
      }

      // 3. Filtre statut
      if (selectedStatus !== "ALL" && u.statutCompte !== selectedStatus) {
        return false;
      }

      // 4. Filtre inclusion
      if (selectedInclusion === "FEMMES" && u.sexe !== "FEMME") return false;
      if (selectedInclusion === "RURAL" && u.milieuResidence !== "RURAL") return false;
      if (selectedInclusion === "SDH" && !u.situationHandicap) return false;

      return true;
    });
  }, [users, searchTerm, selectedRole, selectedStatus, selectedInclusion]);

  // Gestion du changement de statut d'un utilisateur
  const handleStatusChange = (
    userId: string,
    newStatus: "approved" | "rejected" | "suspended" | "active"
  ) => {
    setProcessingId(userId);
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await updateUserStatusAction(userId, newStatus);
        if (result.success) {
          const dbStatus =
            newStatus === "approved" || newStatus === "active"
              ? "ACTIVE"
              : newStatus === "rejected"
              ? "REJECTED"
              : "SUSPENDED";

          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId
                ? {
                    ...u,
                    statutCompte: dbStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : u
            )
          );

          if (selectedUser?.id === userId) {
            setSelectedUser((prev) =>
              prev ? { ...prev, statutCompte: dbStatus } : null
            );
          }

          setFeedback({
            type: "success",
            message: result.message,
          });
        } else {
          setFeedback({
            type: "error",
            message: result.message || "Erreur lors de la mise à jour.",
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

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Prénom",
      "Nom",
      "Email",
      "Téléphone",
      "Rôle",
      "Statut Compte",
      "Âge",
      "Sexe",
      "Milieu Résidence",
      "Situation Handicap (SDH)",
      "Pays",
      "Date Inscription",
    ];

    const rows = filteredUsers.map((u) => [
      u.id,
      `"${(u.prenom || "").replace(/"/g, '""')}"`,
      `"${(u.nom || "").replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.telephone || ""}"`,
      u.role,
      u.statutCompte,
      u.age ?? "",
      u.sexe || "",
      u.milieuResidence || "",
      u.situationHandicap ? "Oui" : "Non",
      `"${u.pays || ""}"`,
      u.createdAt ? new Date(u.createdAt).toISOString() : "",
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `utilisateurs_acceent_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Badge du rôle
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Administrateur",
          cls: "bg-amber-100 text-amber-900 border-amber-300",
        };
      case "MENTOR":
        return {
          label: "Mentor",
          cls: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "EXPERT":
        return {
          label: "Expert",
          cls: "bg-purple-100 text-purple-800 border-purple-300",
        };
      case "PARTENAIRE":
        return {
          label: "Partenaire",
          cls: "bg-teal-100 text-teal-800 border-teal-300",
        };
      case "BENEFICIAIRE":
      default:
        return {
          label: "Bénéficiaire",
          cls: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
    }
  };

  // Badge du statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Actif",
          dotCls: "bg-emerald-500",
          badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "PENDING":
        return {
          label: "En attente",
          dotCls: "bg-amber-500 animate-pulse",
          badgeCls: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "SUSPENDED":
        return {
          label: "Suspendu",
          dotCls: "bg-red-500",
          badgeCls: "bg-red-50 text-red-700 border-red-200",
        };
      case "REJECTED":
        return {
          label: "Refusé",
          dotCls: "bg-slate-400",
          badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
        };
      default:
        return {
          label: status,
          dotCls: "bg-slate-400",
          badgeCls: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast de notification de retour */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border shadow-xs transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground text-xs p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Cartes d'indicateurs rapides réels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => {
            setSelectedRole("ALL");
            setSelectedStatus("ALL");
            setSelectedInclusion("ALL");
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedRole === "ALL" && selectedStatus === "ALL" && selectedInclusion === "ALL"
              ? "bg-primary text-white border-primary shadow-xs"
              : "bg-white border-border text-foreground hover:border-primary/50"
          }`}
        >
          <p className="text-[11px] opacity-80 font-medium">Tous</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </button>

        <button
          onClick={() => {
            setSelectedRole("BENEFICIAIRE");
            setSelectedStatus("ALL");
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedRole === "BENEFICIAIRE"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-white border-border text-foreground hover:border-emerald-300"
          }`}
        >
          <p className="text-[11px] opacity-80 font-medium">Bénéficiaires</p>
          <p className="text-xl font-bold">{stats.beneficiaries}</p>
        </button>

        <button
          onClick={() => {
            setSelectedRole("MENTOR");
            setSelectedStatus("ALL");
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedRole === "MENTOR"
              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
              : "bg-white border-border text-foreground hover:border-blue-300"
          }`}
        >
          <p className="text-[11px] opacity-80 font-medium">Mentors</p>
          <p className="text-xl font-bold">{stats.mentors}</p>
        </button>

        <button
          onClick={() => {
            setSelectedRole("EXPERT");
            setSelectedStatus("ALL");
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedRole === "EXPERT"
              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
              : "bg-white border-border text-foreground hover:border-purple-300"
          }`}
        >
          <p className="text-[11px] opacity-80 font-medium">Experts</p>
          <p className="text-xl font-bold">{stats.experts}</p>
        </button>

        <button
          onClick={() => {
            setSelectedRole("PARTENAIRE");
            setSelectedStatus("ALL");
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedRole === "PARTENAIRE"
              ? "bg-teal-600 text-white border-teal-600 shadow-xs"
              : "bg-white border-border text-foreground hover:border-teal-300"
          }`}
        >
          <p className="text-[11px] opacity-80 font-medium">Partenaires</p>
          <p className="text-xl font-bold">{stats.partners}</p>
        </button>

        <button
          onClick={() => {
            setSelectedStatus("PENDING");
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === "PENDING"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : "bg-white border-border text-foreground hover:border-amber-300"
          }`}
        >
          <p className="text-[11px] opacity-80 font-medium">En attente</p>
          <p className="text-xl font-bold">{stats.pending}</p>
        </button>

        <button
          onClick={() => {
            setSelectedInclusion("SDH");
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedInclusion === "SDH"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
              : "bg-white border-border text-foreground hover:border-indigo-300"
          }`}
        >
          <p className="text-[11px] opacity-80 font-medium">Inclusion SDH</p>
          <p className="text-xl font-bold">{stats.sdh}</p>
        </button>
      </div>

      {/* Barre de filtres et recherche interactive */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Sélecteur Rôle */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-2 bg-white text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="BENEFICIAIRE">Bénéficiaires</option>
            <option value="MENTOR">Mentors</option>
            <option value="EXPERT">Experts</option>
            <option value="PARTENAIRE">Partenaires</option>
            <option value="ADMIN">Administrateurs</option>
          </select>

          {/* Sélecteur Statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-2 bg-white text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="PENDING">En attente</option>
            <option value="SUSPENDED">Suspendus</option>
            <option value="REJECTED">Refusés</option>
          </select>

          {/* Sélecteur Inclusion */}
          <select
            value={selectedInclusion}
            onChange={(e) => setSelectedInclusion(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-2 bg-white text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">Toute la population</option>
            <option value="FEMMES">Femmes uniquement</option>
            <option value="RURAL">Milieu rural uniquement</option>
            <option value="SDH">Handicap (SDH) uniquement</option>
          </select>

          {/* Bouton Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 h-9 rounded-lg"
          >
            <Download className="h-3.5 w-3.5" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Résumé du filtrage */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Affichage de <strong className="text-foreground">{filteredUsers.length}</strong> utilisateur(s) sur{" "}
          <strong className="text-foreground">{users.length}</strong> au total
        </span>

        {(selectedRole !== "ALL" ||
          selectedStatus !== "ALL" ||
          selectedInclusion !== "ALL" ||
          searchTerm) && (
          <button
            onClick={() => {
              setSelectedRole("ALL");
              setSelectedStatus("ALL");
              setSelectedInclusion("ALL");
              setSearchTerm("");
            }}
            className="text-primary hover:underline font-medium text-xs flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Table principale */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Aucun utilisateur ne correspond à ces critères
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Essayez de modifier votre recherche ou de réinitialiser les filtres de rôle et de statut.
            </p>
          </div>
        ) : (
          <Table className="text-xs">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-3.5 text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                  Utilisateur
                </TableHead>
                <TableHead className="px-4 py-3.5 text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                  Rôle
                </TableHead>
                <TableHead className="px-4 py-3.5 text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                  Profil &amp; Inclusion
                </TableHead>
                <TableHead className="px-4 py-3.5 text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                  Localisation
                </TableHead>
                <TableHead className="px-4 py-3.5 text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                  Statut Compte
                </TableHead>
                <TableHead className="px-4 py-3.5 text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                  Date Inscription
                </TableHead>
                <TableHead className="px-4 py-3.5 text-right text-muted-foreground uppercase font-semibold text-[11px] tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const statusBadge = getStatusBadge(user.statutCompte);
                const isProcessing = processingId === user.id;

                const dateStr = user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                const initials =
                  `${user.prenom?.charAt(0) || ""}${user.nom?.charAt(0) || ""}`.toUpperCase() ||
                  "U";

                return (
                  <TableRow
                    key={user.id}
                    data-state={selectedUser?.id === user.id ? "selected" : undefined}
                    className="group cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    {/* Identité */}
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {user.prenom} {user.nom}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1 truncate text-[11px]">
                            <Mail className="h-3 w-3 shrink-0" />
                            {user.email}
                          </p>
                          {user.telephone && (
                            <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <Phone className="h-3 w-3 shrink-0" />
                              {user.telephone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Rôle */}
                    <TableCell className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadge.cls}`}
                      >
                        {roleBadge.label}
                      </span>
                    </TableCell>

                    {/* Profil & Inclusion */}
                    <TableCell className="px-4 py-3.5 text-muted-foreground space-y-0.5">
                      <div>
                        <span>{user.sexe || "Non précisé"}</span>
                        {user.age ? ` · ${user.age} ans` : ""}
                      </div>
                      {user.situationHandicap && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          <HeartHandshake className="h-3 w-3" />
                          SDH (Handicap)
                        </span>
                      )}
                    </TableCell>

                    {/* Localisation */}
                    <TableCell className="px-4 py-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {user.pays || "Non renseigné"}
                      </span>
                      {user.milieuResidence && (
                        <span className="text-[11px] text-slate-500 block">
                          Milieu {user.milieuResidence.toLowerCase()}
                        </span>
                      )}
                    </TableCell>

                    {/* Statut Compte */}
                    <TableCell className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.badgeCls}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotCls}`}
                        />
                        {statusBadge.label}
                      </span>
                    </TableCell>

                    {/* Date d'inscription */}
                    <TableCell className="px-4 py-3.5 text-muted-foreground text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        {dateStr}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Détails
                      </Button>

                      {user.statutCompte === "PENDING" && (
                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(user.id, "approved")}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Approuver
                        </Button>
                      )}

                      {user.statutCompte === "ACTIVE" && user.role !== "ADMIN" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(user.id, "suspended")}
                          className="h-8 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          Suspendre
                        </Button>
                      )}

                      {user.statutCompte === "SUSPENDED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleStatusChange(user.id, "active")}
                          className="h-8 px-2 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          Réactiver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="px-5 py-3 text-xs text-muted-foreground">
                  Total affiché :{" "}
                  <strong className="text-foreground">{filteredUsers.length}</strong> /{" "}
                  <strong className="text-foreground">{users.length}</strong> utilisateur(s)
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>

      {/* MODAL FICHE DÉTAILLÉE DE L'UTILISATEUR */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-lg w-full border border-border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20">
                  {`${selectedUser.prenom?.charAt(0) || ""}${selectedUser.nom?.charAt(0) || ""}`.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {selectedUser.prenom} {selectedUser.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corps de la modal */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Badges Rôle & Statut */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                    getRoleBadge(selectedUser.role).cls
                  }`}
                >
                  {getRoleBadge(selectedUser.role).label}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    getStatusBadge(selectedUser.statutCompte).badgeCls
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      getStatusBadge(selectedUser.statutCompte).dotCls
                    }`}
                  />
                  Statut : {getStatusBadge(selectedUser.statutCompte).label}
                </span>
              </div>

              {/* Informations personnelles */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-2">
                <h4 className="font-semibold text-foreground text-[11px] uppercase tracking-wider text-slate-500">
                  Coordonnées & Identité
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email :</span>
                    <span className="font-medium text-foreground">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Téléphone :</span>
                    <span className="font-medium text-foreground">
                      {selectedUser.telephone || "Non renseigné"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Âge :</span>
                    <span className="font-medium text-foreground">
                      {selectedUser.age ? `${selectedUser.age} ans` : "Non renseigné"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Sexe :</span>
                    <span className="font-medium text-foreground">
                      {selectedUser.sexe || "Non renseigné"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Localisation & Résidence */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-2">
                <h4 className="font-semibold text-foreground text-[11px] uppercase tracking-wider text-slate-500">
                  Résidence & Territoire
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Pays :</span>
                    <span className="font-medium text-foreground">{selectedUser.pays}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Milieu :</span>
                    <span className="font-medium text-foreground">
                      {selectedUser.milieuResidence || "Non renseigné"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inclusion & Données sensibles */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-2">
                <h4 className="font-semibold text-foreground text-[11px] uppercase tracking-wider text-slate-500">
                  Inclusion & Protection des données
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Situation de Handicap (SDH) :</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        selectedUser.situationHandicap
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {selectedUser.situationHandicap ? "Oui (Déclaré)" : "Non"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Identifiant Supabase Auth :</span>
                    <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-border">
                      {selectedUser.supabaseUid || selectedUser.id}
                    </code>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Inscrit le :</span>
                    <span>
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Non renseigné"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions dans la modal */}
            <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="text-xs"
              >
                Fermer
              </Button>

              <div className="flex items-center gap-2">
                {selectedUser.statutCompte !== "ACTIVE" && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(selectedUser.id, "active")}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Activer le compte
                  </Button>
                )}

                {selectedUser.statutCompte === "ACTIVE" && selectedUser.role !== "ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleStatusChange(selectedUser.id, "suspended")}
                    className="text-xs text-red-700 border-red-300 hover:bg-red-50 gap-1"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Suspendre le compte
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
