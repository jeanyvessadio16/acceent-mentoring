'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { AdminUserItem } from '@/lib/api/admin';
import { updateUserStatusAction } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/formatters';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AdminUsersClientProps {
  initialUsers: AdminUserItem[];
  total: number;
}

export function AdminUsersClient({ initialUsers, total }: AdminUsersClientProps) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Modal suspendre
  const [suspendingUser, setSuspendingUser] = useState<AdminUserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Filtrage local en temps réel sur la liste
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalDisplay = Math.max(total, users.length);
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;
  const mentorCount = users.filter((u) => u.role === 'MENTOR').length;
  const beneficiaryCount = users.filter((u) => u.role === 'BENEFICIARY').length;

  const handleToggleStatus = (user: AdminUserItem, targetStatus: 'ACTIVE' | 'SUSPENDED', reason?: string) => {
    startTransition(async () => {
      setFeedback(null);
      const res = await updateUserStatusAction(user.id, targetStatus, reason);

      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: targetStatus } : u))
        );
        setFeedback({ type: 'success', message: res.message });
        setSuspendingUser(null);
        setSuspendReason('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return <Badge className="bg-amber-600/10 text-amber-700 border-amber-200">Admin</Badge>;
      case 'MENTOR':
        return <Badge className="bg-emerald-600/10 text-emerald-700 border-emerald-200">Mentor</Badge>;
      case 'EXPERT':
        return <Badge className="bg-purple-600/10 text-purple-700 border-purple-200">Expert</Badge>;
      case 'PARTNER':
        return <Badge className="bg-indigo-600/10 text-indigo-700 border-indigo-200">Partenaire</Badge>;
      default:
        return <Badge className="bg-blue-600/10 text-blue-700 border-blue-200">Bénéficiaire</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Actif
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Suspendu
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0 text-destructive" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Cartes de synthèse utilisateurs réels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Comptes</p>
              <p className="text-xl font-bold text-foreground">{totalDisplay}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Comptes Actifs</p>
              <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Bénéficiaires</p>
              <p className="text-xl font-bold text-blue-600">{beneficiaryCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Comptes Suspendus</p>
              <p className="text-xl font-bold text-rose-600">{suspendedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="BENEFICIARY">Bénéficiaires</option>
              <option value="MENTOR">Mentors</option>
              <option value="EXPERT">Experts</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="PARTNER">Partenaires</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="SUSPENDED">Suspendus</option>
              <option value="PENDING_VERIFICATION">En attente vérif.</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table des utilisateurs */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Localisation & Contact</th>
                <th className="py-3 px-4">Date d'inscription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const name = u.profile?.firstName
                    ? `${u.profile.firstName} ${u.profile.lastName || ''}`.trim()
                    : 'Profil non renseigné';
                  const initials = u.profile?.firstName
                    ? `${u.profile.firstName[0]}${u.profile.lastName?.[0] || ''}`.toUpperCase()
                    : (u.email || 'US').substring(0, 2).toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">{name}</p>
                            <p className="text-muted-foreground text-xs flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground/70" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {getRoleBadge(u.role)}
                          {u.mentorProfile && (
                            <p className="text-[10px] text-muted-foreground">
                              Mentor: {u.mentorProfile.validationStatus}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(u.status)}</td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-muted-foreground">
                          {(u.profile?.city || u.profile?.country) && (
                            <p className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-muted-foreground/70" />
                              {[u.profile?.city, u.profile?.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                          {u.profile?.phone && (
                            <p className="text-[11px] font-mono">{u.profile.phone}</p>
                          )}
                          {!u.profile?.city && !u.profile?.phone && (
                            <span className="text-[11px] text-muted-foreground/60">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-muted-foreground/70" />
                          {formatDate(u.createdAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.status === 'ACTIVE' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => {
                              setSuspendingUser(u);
                              setSuspendReason('');
                            }}
                            className="text-xs h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            Suspendre
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleToggleStatus(u, 'ACTIVE')}
                            className="text-xs h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            Réactiver
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                    Aucun utilisateur ne correspond aux critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de suspension d'utilisateur */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Suspendre ce compte</h3>
                <p className="text-xs text-muted-foreground">Action d'administration sensible</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1">
              <p>
                <strong className="text-foreground">Utilisateur : </strong>
                {suspendingUser.profile?.firstName
                  ? `${suspendingUser.profile.firstName} ${suspendingUser.profile.lastName || ''}`
                  : suspendingUser.email}
              </p>
              <p>
                <strong className="text-foreground">Email : </strong>
                {suspendingUser.email}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Motif de la suspension (facultatif mais tracé dans l'audit) :
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Ex: Signalement confirmé, non respect de la charte..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background focus:ring-1 focus:ring-ring focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuspendingUser(null)}
                disabled={isPending}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => handleToggleStatus(suspendingUser, 'SUSPENDED', suspendReason)}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Suspension...
                  </>
                ) : (
                  'Confirmer la suspension'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
