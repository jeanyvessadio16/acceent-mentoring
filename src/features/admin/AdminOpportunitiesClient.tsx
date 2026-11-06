'use client';

import React, { useState, useTransition } from 'react';
import { OpportunityItem, OpportunityCategory, CreateOpportunityInput } from '@/lib/api/opportunities';
import { createOpportunityAction } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/formatters';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Building,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  EMPLOYMENT: 'Emploi & CDI/CDD',
  INTERNSHIP: 'Stage & Alternance',
  TRAINING: 'Formation & Certificat',
  COMPETITION: 'Concours & Challenge',
  SCHOLARSHIP: 'Bourse d’études',
  FUNDING: 'Financement & Subvention',
  CALL_FOR_PROJECTS: 'Appel à projets',
  EVENT: 'Événement & Webinaire',
};

interface AdminOpportunitiesClientProps {
  initialOpportunities: OpportunityItem[];
  total: number;
}

export function AdminOpportunitiesClient({
  initialOpportunities,
  total,
}: AdminOpportunitiesClientProps) {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(initialOpportunities);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateOpportunityInput>({
    title: '',
    organization: '',
    category: 'CALL_FOR_PROJECTS',
    description: '',
    country: 'Sénégal',
    city: 'Dakar',
    externalUrl: '',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const filteredOpportunities = opportunities.filter((op) => {
    const text = `${op.title} ${op.organization} ${op.description}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || op.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const employmentCount = opportunities.filter(
    (o) => o.category === 'EMPLOYMENT' || o.category === 'INTERNSHIP'
  ).length;
  const fundingCount = opportunities.filter(
    (o) => o.category === 'FUNDING' || o.category === 'CALL_FOR_PROJECTS'
  ).length;
  const trainingCount = opportunities.filter(
    (o) => o.category === 'TRAINING' || o.category === 'EVENT'
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setFeedback(null);
      // Format ISO string pour expiresAt
      const isoExpiresAt = new Date(formData.expiresAt).toISOString();
      const res = await createOpportunityAction({
        ...formData,
        expiresAt: isoExpiresAt,
      });

      if (res.success && res.data) {
        setOpportunities((prev) => [res.data, ...prev]);
        setFeedback({ type: 'success', message: res.message });
        setIsModalOpen(false);
        setFormData({
          title: '',
          organization: '',
          category: 'CALL_FOR_PROJECTS',
          description: '',
          country: 'Sénégal',
          city: 'Dakar',
          externalUrl: '',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    });
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

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Opportunités</p>
              <p className="text-xl font-bold text-foreground">{opportunities.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Financements & Projets</p>
              <p className="text-xl font-bold text-emerald-600">{fundingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Emplois & Stages</p>
              <p className="text-xl font-bold text-blue-600">{employmentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Formations & Events</p>
              <p className="text-xl font-bold text-purple-600">{trainingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'action, recherche et filtres */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par titre, structure..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">Toutes les catégories</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Publier une opportunité
          </Button>
        </CardContent>
      </Card>

      {/* Liste des opportunités */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.length > 0 ? (
          filteredOpportunities.map((op) => {
            const isExpired = new Date(op.expiresAt).getTime() < Date.now();

            return (
              <Card
                key={op.id}
                className="shadow-xs border-border/80 hover:border-brand-primary/40 transition-colors flex flex-col justify-between"
              >
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {CATEGORY_LABELS[op.category] || op.category}
                    </Badge>
                    {isExpired ? (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Expirée
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-foreground leading-snug">
                    {op.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-muted-foreground/70" />
                    {op.organization}
                    {(op.city || op.country) && (
                      <>
                        <span className="text-muted-foreground/40">•</span>
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {[op.city, op.country].filter(Boolean).join(', ')}
                      </>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {op.description}
                  </p>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                      <span>Date limite :</span>
                      <strong className="text-foreground">{formatDate(op.expiresAt)}</strong>
                    </div>

                    <a
                      href={op.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                    >
                      Consulter le lien <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center border rounded-2xl bg-card border-dashed">
            <Briefcase className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <h4 className="font-semibold text-sm text-foreground">Aucune opportunité trouvée</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Modifiez vos critères ou publiez une nouvelle opportunité pour les bénéficiaires.
            </p>
          </div>
        )}
      </div>

      {/* Modal Créer une opportunité */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-brand-primary">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-bold text-base text-foreground">
                  Publier une nouvelle opportunité
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Titre de l'opportunité *</label>
                <Input
                  required
                  placeholder="Ex: Programme d'accélération et financement PME numériques 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Structure / Organisation *</label>
                  <Input
                    required
                    placeholder="Ex: DER/FJ, Ministère, Société..."
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Catégorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as OpportunityCategory,
                      })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Description détaillée *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrivez les objectifs, critères d'éligibilité et bénéfices pour les candidats..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Pays</label>
                  <Input
                    placeholder="Sénégal"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Ville</label>
                  <Input
                    placeholder="Dakar, Saint-Louis..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Lien externe de candidature / information *
                </label>
                <Input
                  required
                  type="url"
                  placeholder="https://exemple.sn/candidature"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Date d'expiration / Clôture des candidatures *
                </label>
                <Input
                  required
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-brand-primary hover:bg-brand-secondary text-white text-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Publication...
                    </>
                  ) : (
                    'Publier l’opportunité'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

