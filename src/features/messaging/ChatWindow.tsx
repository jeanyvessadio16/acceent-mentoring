'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConversationItem, MessageItem, messagingApi } from '@/lib/api/messaging';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, MessageSquare, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

interface ChatWindowProps {
  initialConversations: ConversationItem[];
  currentUserId: string;
  token: string;
}

export function ChatWindow({ initialConversations, currentUserId, token }: ChatWindowProps) {
  const [conversations] = useState<ConversationItem[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string>(
    initialConversations[0]?.id || ''
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Trouver l'interlocuteur (l'autre participant)
  const otherParticipant = activeConversation?.participants?.find(
    (p) => p.userId !== currentUserId
  );
  const otherName = otherParticipant?.user?.profile
    ? `${otherParticipant.user.profile.firstName} ${otherParticipant.user.profile.lastName}`
    : 'Mentor ACCEENT';

  // Charger les messages de la conversation active
  useEffect(() => {
    if (!activeConvId) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    messagingApi
      .getMessages(activeConvId, token)
      .then((res) => {
        if (isMounted) {
          // Inverser l'ordre si l'API renvoie desc
          const sorted = [...(res.items || [])].reverse();
          setMessages(sorted);
        }
      })
      .catch((err) => console.error('Erreur chargement messages:', err))
      .finally(() => {
        if (isMounted) setIsLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeConvId, token]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvId || isSending) return;

    const content = newMsg.trim();
    setNewMsg('');
    setIsSending(true);

    try {
      const createdMessage = await messagingApi.sendMessage(activeConvId, content, token);
      setMessages((prev) => [...prev, createdMessage]);
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Liste des conversations */}
      <Card className="shadow-xs md:col-span-1 overflow-hidden flex flex-col border-border">
        <div className="p-3 border-b border-border bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
          Discussions actives ({conversations.length})
        </div>
        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {conversations.map((conv) => {
            const partner = conv.participants?.find((p) => p.userId !== currentUserId);
            const partnerName = partner?.user?.profile
              ? `${partner.user.profile.firstName} ${partner.user.profile.lastName}`
              : 'Interlocuteur';
            const lastMsg = conv.messages?.[0]?.content || 'Nouvelle conversation';
            const isSelected = conv.id === activeConvId;

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary/40 text-foreground'
                    : 'bg-card border-border hover:bg-secondary/40'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {partnerName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-xs text-foreground truncate">{partnerName}</p>
                    <span className="text-[9px] text-muted-foreground uppercase font-medium">
                      {partner?.user?.role === 'MENTOR' ? 'Mentor' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{lastMsg}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Fenêtre de chat */}
      <Card className="shadow-xs md:col-span-2 flex flex-col overflow-hidden border-border">
        {/* Entête du chat */}
        <div className="p-3 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-xs">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">{otherName}</p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Disponible
              </p>
            </div>
          </div>
        </div>

        {/* Corps des messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-secondary/15">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              Chargement des messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 text-brand-primary/40" />
              <p className="font-medium">Aucun message pour l'instant</p>
              <p className="text-[11px]">Envoyez votre premier message pour lancer la discussion.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === currentUserId;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isMine
                        ? 'bg-brand-primary text-white rounded-br-xs'
                        : 'bg-card border border-border text-foreground rounded-bl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulaire d'envoi */}
        <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2">
          <Input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Écrivez votre message..."
            disabled={isSending || !activeConvId}
            className="text-xs h-9"
          />
          <Button
            type="submit"
            disabled={isSending || !newMsg.trim() || !activeConvId}
            size="sm"
            className="bg-brand-primary hover:bg-brand-secondary text-white text-xs h-9 px-4 shrink-0"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            {isSending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

