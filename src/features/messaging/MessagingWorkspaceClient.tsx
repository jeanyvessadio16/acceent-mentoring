"use client";

import { useRef, useState, useTransition } from "react";
import {
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Send,
  X,
} from "lucide-react";

import {
  getConversationMessagesAction,
  markConversationReadAction,
  sendConversationMessageAction,
  uploadMessageAttachmentAction,
  type ChatMessageApiItem,
  type ConversationApiItem,
  type UploadedAttachmentPayload,
} from "@/lib/actions/messaging";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import { ReportModalButton } from "@/features/moderation/ReportModalButton";
import { Button } from "@/components/ui/button";

interface MessagingWorkspaceClientProps {
  initialConversations: ConversationApiItem[];
  initialConversationId: string | null;
  initialMessages: ChatMessageApiItem[];
  startupError?: string | null;
}

function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function MessagingWorkspaceClient({
  initialConversations,
  initialConversationId,
  initialMessages,
  startupError = null,
}: MessagingWorkspaceClientProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [conversations, setConversations] =
    useState<ConversationApiItem[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId
  );
  const [messages, setMessages] =
    useState<ChatMessageApiItem[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<
    UploadedAttachmentPayload[]
  >([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(startupError);
  const [isPending, startTransition] = useTransition();

  const activeConversation =
    conversations.find((c) => c.id === selectedId) ?? null;

  const chronologicalMessages = [...messages].reverse();

  function handleSelectConversation(convId: string) {
    setErrorMessage(null);
    setPendingAttachments([]);
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

  async function handleSelectAttachment(file: File) {
    if (!selectedId) return;
    if (pendingAttachments.length >= 3) {
      setErrorMessage("Vous pouvez joindre au maximum 3 fichiers par message.");
      return;
    }

    setErrorMessage(null);
    setIsUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadMessageAttachmentAction(selectedId, formData);
      if (!res.ok || !res.data) {
        setErrorMessage(
          res.error ?? "Impossible de téléverser cette pièce jointe."
        );
        return;
      }
      setPendingAttachments((prev) => [...prev, res.data!]);
    } catch {
      setErrorMessage("Erreur réseau pendant le téléversement du fichier.");
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedId) return;
    const trimmedContent = draft.trim();
    if (!trimmedContent && pendingAttachments.length === 0) return;

    const finalContent = trimmedContent || "Pièce jointe partagée";
    const attachmentsToSend = [...pendingAttachments];
    setErrorMessage(null);

    startTransition(async () => {
      const res = await sendConversationMessageAction(
        selectedId,
        finalContent,
        attachmentsToSend
      );
      if (!res.ok || !res.data) {
        setErrorMessage(res.error ?? "Impossible d'envoyer ce message.");
        return;
      }

      setDraft("");
      setPendingAttachments([]);
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
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs space-y-2 ${
                              isMine
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-foreground"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>

                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                {msg.attachments.map((att) => {
                                  const safeFileUrl = sanitizeExternalUrl(
                                    att.fileUrl
                                  );
                                  if (!safeFileUrl) return null;
                                  return (
                                    <a
                                      key={att.id}
                                      href={safeFileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-colors ${
                                        isMine
                                          ? "bg-white/10 border-white/25 text-white hover:bg-white/20"
                                          : "bg-white border-border text-foreground hover:bg-slate-50"
                                      }`}
                                    >
                                      <span className="inline-flex items-center gap-1.5 truncate">
                                        <FileText className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                          {att.fileName}
                                        </span>
                                      </span>
                                      <span className="inline-flex items-center gap-1 shrink-0 opacity-85">
                                        <span>
                                          {formatAttachmentSize(att.fileSize)}
                                        </span>
                                        <ExternalLink className="h-3 w-3" />
                                      </span>
                                    </a>
                                  );
                                })}
                              </div>
                            )}

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

                <div className="border-t border-border bg-white">
                  {pendingAttachments.length > 0 && (
                    <div className="px-4 pt-3 flex flex-wrap gap-2">
                      {pendingAttachments.map((att, idx) => (
                        <span
                          key={`${att.fileName}-${idx}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="max-w-[160px] truncate">
                            {att.fileName}
                          </span>
                          <span className="text-[10px] opacity-75">
                            ({formatAttachmentSize(att.fileSize)})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingAttachments((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            aria-label={`Retirer ${att.fileName}`}
                            className="hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleSend}
                    className="p-4 flex items-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleSelectAttachment(file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isUploadingAttachment || isPending}
                      onClick={() => fileInputRef.current?.click()}
                      title="Joindre un fichier (PDF, JPG, PNG, WEBP · max 5 Mo)"
                      aria-label="Joindre une pièce jointe"
                      className="rounded-full h-10 w-10 shrink-0"
                    >
                      {isUploadingAttachment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                    </Button>
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
                      disabled={
                        isPending ||
                        isUploadingAttachment ||
                        (!draft.trim() && pendingAttachments.length === 0)
                      }
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
                </div>
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
