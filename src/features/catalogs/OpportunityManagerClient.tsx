"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import {
  createOpportunityAction,
  deleteOpportunityAction,
  updateOpportunityAction,
  type OpportunityApiItem,
  type OpportunityCategoryValue,
  type OpportunityStatusValue,
} from "@/lib/actions/catalogs";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OpportunityManagerClientProps {
  initialOpportunities: OpportunityApiItem[];
}

const CATEGORIES: OpportunityCategoryValue[] = [
  "EMPLOI",
  "STAGE",
  "FORMATION",
  "CONCOURS",
  "BOURSE",
  "FINANCEMENT",
  "APPEL_PROJETS",
  "EVENEMENT",
];

export function OpportunityManagerClient({
  initialOpportunities,
}: OpportunityManagerClientProps) {
  const router = useRouter();
  const [opportunities, setOpportunities] =
    useState<OpportunityApiItem[]>(initialOpportunities);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [titre, setTitre] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [categorie, setCategorie] =
    useState<OpportunityCategoryValue>("EMPLOI");
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [typeContrat, setTypeContrat] = useState("");
  const [lienCandidature, setLienCandidature] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    if (
      !titre.trim() ||
      !organisation.trim() ||
      !description.trim() ||
      !lienCandidature.trim() ||
      !dateExpiration
    ) {
      setFeedback({
        type: "error",
        text: "Merci de remplir tous les champs obligatoires.",
      });
      return;
    }

    startTransition(async () => {
      const res = await createOpportunityAction({
        titre: titre.trim(),
        organisation: organisation.trim(),
        categorie,
        description: description.trim(),
        localisation: localisation.trim() || undefined,
        typeContrat: typeContrat.trim() || undefined,
        lienCandidature: lienCandidature.trim(),
        dateExpiration: new Date(`${dateExpiration}T23:59:59`).toISOString(),
      });

      if (!res.ok || !res.data) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de publier cette opportunité.",
        });
        return;
      }

      setOpportunities((prev) => [res.data!, ...prev]);
      setTitre("");
      setOrganisation("");
      setDescription("");
      setLocalisation("");
      setTypeContrat("");
      setLienCandidature("");
      setDateExpiration("");
      setShowCreateForm(false);
      setFeedback({
        type: "success",
        text: "Opportunité publiée avec succès.",
      });
      router.refresh();
    });
  }

  function handleStatusChange(id: string, status: OpportunityStatusValue) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateOpportunityAction(id, { status });
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de changer le statut.",
        });
        return;
      }
      setOpportunities((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteOpportunityAction(id);
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: res.error ?? "Impossible de supprimer cette opportunité.",
        });
        return;
      }
      setOpportunities((prev) => prev.filter((item) => item.id !== id));
      setFeedback({ type: "success", text: "Opportunité supprimée." });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="rounded-full px-5"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {showCreateForm ? "Fermer le formulaire" : "Créer une opportunité"}
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4"
        >
          <h2 className="text-base font-bold text-foreground">
            Publier une nouvelle opportunité
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="opp-title">Titre *</Label>
              <Input
                id="opp-title"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-org">Organisation *</Label>
              <Input
                id="opp-org"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-cat">Catégorie *</Label>
              <select
                id="opp-cat"
                value={categorie}
                onChange={(e) =>
                  setCategorie(e.target.value as OpportunityCategoryValue)
                }
                className="h-9 w-full rounded-xl border border-input bg-white px-3 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-exp">Date limite *</Label>
              <Input
                id="opp-exp"
                type="date"
                value={dateExpiration}
                onChange={(e) => setDateExpiration(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-loc">Localisation</Label>
              <Input
                id="opp-loc"
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
                placeholder="Ex : Dakar, Sénégal / À distance"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opp-contract">Type de contrat / format</Label>
              <Input
                id="opp-contract"
                value={typeContrat}
                onChange={(e) => setTypeContrat(e.target.value)}
                placeholder="Ex : CDI, Stage 6 mois, Subvention"
                className="rounded-xl"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="opp-url">Lien de candidature *</Label>
              <Input
                id="opp-url"
                type="url"
                value={lienCandidature}
                onChange={(e) => setLienCandidature(e.target.value)}
                placeholder="https://..."
                required
                className="rounded-xl"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="opp-desc">Description *</Label>
              <textarea
                id="opp-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="rounded-full"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Publier l&apos;opportunité
            </Button>
          </div>
        </form>
      )}

      {opportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-2">
          <Briefcase className="h-9 w-9 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">
            Aucune opportunité publiée
          </h2>
          <p className="text-xs text-muted-foreground">
            Cliquez sur &quot;Créer une opportunité&quot; pour partager une offre ou un
            financement avec les bénéficiaires.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const safeUrl = sanitizeExternalUrl(opp.lienCandidature);
            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-border p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {opp.titre}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary">
                      {opp.categorie}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {opp.organisation}
                      {opp.localisation ? ` · ${opp.localisation}` : ""}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Expire le{" "}
                    {new Date(opp.dateExpiration).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {safeUrl && (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15"
                    >
                      <span>Voir l&apos;offre</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <select
                    aria-label="Statut de l'opportunité"
                    value={opp.status}
                    disabled={isPending}
                    onChange={(e) =>
                      handleStatusChange(
                        opp.id,
                        e.target.value as OpportunityStatusValue
                      )
                    }
                    className="h-8 rounded-full border border-input bg-white px-3 text-xs font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(opp.id)}
                    aria-label="Supprimer l'opportunité"
                    className="p-2 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
