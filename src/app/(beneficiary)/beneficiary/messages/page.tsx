import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  getConversationMessagesAction,
  listConversationsAction,
  startConversationAction,
} from "@/lib/actions/messaging";
import { MessagingWorkspaceClient } from "@/features/messaging/MessagingWorkspaceClient";

export const instant = false;

export const metadata: Metadata = {
  title: "Messagerie | Espace Bénéficiaire ACCEENT",
  description:
    "Échangez directement avec vos mentors et suivez vos conversations actives.",
};

export default async function BeneficiaryMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ recipientId?: string }>;
}) {
  const { recipientId } = await searchParams;
  let startupError: string | null = null;
  let startedConvId: string | null = null;

  if (recipientId) {
    const started = await startConversationAction(recipientId);
    if (started.ok && started.data) {
      startedConvId = started.data.id;
    } else if (!started.ok) {
      startupError = started.error ?? null;
    }
  }

  const convsRes = await listConversationsAction();
  const initialConversationId =
    startedConvId ?? (convsRes.data.length > 0 ? convsRes.data[0].id : null);

  const initialMessages = initialConversationId
    ? (await getConversationMessagesAction(initialConversationId)).data
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/dashboard/beneficiaire"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au tableau de bord</span>
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Messagerie interne
        </h1>
        <p className="text-sm text-muted-foreground">
          Communiquez avec vos mentors dans un espace sécurisé dédié à votre
          accompagnement.
        </p>
      </div>

      <MessagingWorkspaceClient
        initialConversations={convsRes.data}
        initialConversationId={initialConversationId}
        initialMessages={initialMessages}
        startupError={startupError}
      />
    </div>
  );
}
