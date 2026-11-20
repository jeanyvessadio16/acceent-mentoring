"use client";

import { useState, useTransition } from "react";
import { Loader2, MessageSquare, RefreshCw, Send } from "lucide-react";

import {
  getConversationMessagesAction,
  markConversationReadAction,
  sendConversationMessageAction,
  type ChatMessageApiItem,
  type ConversationApiItem,
} from "@/lib/actions/messaging";
import { ReportModalButton } from "@/features/moderation/ReportModalButton";
import { Button } from "@/components/ui/button";

interface MessagingWorkspaceClientProps {
  initialConversations: ConversationApiItem[];
  initialConversationId: string | null;
  initialMessages: ChatMessageApiItem[];
  startupError?: string | null;
}

export function MessagingWorkspaceClient({
  initialConversations,
  initialConversationId,
  initialMessages,
  startupError = null,
}: MessagingWorkspaceClientProps) {
  const [conversations, setConversations] =
    useState<ConversationApiItem[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId
  );
  const [messages, setMessages] =
    useState<ChatMessageApiItem[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(startupError);
  const [isPending, startTransition] = useTransition();

  const activeConversation =
    conversations.find((c) => c.id === selectedId) ?? null;

  const chronologicalMessages = [...messages].reverse();

  function handleSelectConversation(convId: string) {
    setErrorMessage(null);
    setSelectedId(convId);
    startTransition(async () => {
      const msgRes = await getConversationMessagesAction(convId);
      if (msgRes.ok) {
        setMessages(msgRes.data);
      } else {
        setErrorMessage(msgRes.error ?? "Impossible de charger les messages.");
      }
      await markConversationReadAction(convId);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    });
  }

  function handleRefresh() {
    if (!selectedId) return;
    setErrorMessage(null);
    startTransition(async () => {
      const msgRes = await getConversationMessagesAction(selectedId);
      if (msgRes.ok) {
        setMessages(msgRes.data);
      }
    });
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setErrorMessage(null);
    const content = draft.trim();

    startTransition(async () => {
      const res = await sendConversationMessageAction(selectedId, content);
      if (!res.ok || !res.data) {
        setErrorMessage(res.error ?? "Impossible d'envoyer ce message.");
        return;
      }

      setDraft("");
      setMessages((prev) => [res.data!, ...prev]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                lastMessage: res.data!,
                lastMessageAt: res.data!.createdAt,
              }
            : c
        )
      );
    });
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-3">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">
            Aucune conversation pour le moment
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Envoyez une demande de mentoring ou démarrez un parcours pour
            échanger directement via la messagerie sécurisée ACCEENT.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
          <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border divide-y divide-border/70 max-h-[320px] lg:max-h-[620px] overflow-y-auto">
            {conversations.map((conv) => {
              const other = conv.otherParticipant;
              const name = `${other.prenom} ${other.nom}`.trim() || "Contact";
              const isSelected = conv.id === selectedId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left p-4 transition-colors flex items-start justify-between gap-2 ${
                    isSelected ? "bg-primary/5" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">
                        {name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {other.role}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage?.content || "Nouvelle conversation"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          <div className="lg:col-span-8 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {activeConversation.otherParticipant.prenom}{" "}
                      {activeConversation.otherParticipant.nom}
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Rôle : {activeConversation.otherParticipant.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isPending}
                      onClick={handleRefresh}
                      className="rounded-full"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Actualiser
                    </Button>
                    <ReportModalButton
                      reportedUserId={activeConversation.otherParticipant.id}
                      targetType="CONVERSATION"
                      targetId={activeConversation.id}
                      label="Signaler"
                    />
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px]">
                  {chronologicalMessages.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Écrivez le premier message pour lancer l&apos;échange.
                    </p>
                  ) : (
                    chronologicalMessages.map((msg) => {
                      const isMine =
                        msg.senderId !== activeConversation.otherParticipant.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs space-y-1 ${
                              isMine
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-foreground"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <p
                              className={`text-[10px] ${
                                isMine ? "text-white/75" : "text-muted-foreground"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-border flex items-center gap-2 bg-white"
                >
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Écrivez votre message..."
                    aria-label="Message"
                    className="flex-1 h-10 rounded-full border border-input bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    type="submit"
                    disabled={isPending || !draft.trim()}
                    className="rounded-full h-10 px-5"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1.5" />
                    )}
                    Envoyer
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
                Sélectionnez une conversation pour afficher les messages.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
