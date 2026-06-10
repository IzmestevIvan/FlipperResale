"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { formatPrice } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  listing: { id: string; title: string; images: string[]; price: number; status: string };
  other: { id: string; name: string | null; avatar: string | null } | null;
  lastMessage: { text: string; createdAt: string } | null;
  unread: number;
  updatedAt: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sp = useSearchParams();
  const activeId = sp.get("id");

  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/messages/conversations").then((r) => r.json()).then(setConversations);
  }, [status, router]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Сообщения
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              <p>Нет диалогов</p>
              <p className="mt-1">Найдите объявление и напишите продавцу</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/chat?id=${conv.id}`}
                className={`flex gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  active?.id === conv.id ? "bg-brand-50 border-l-2 border-l-brand-500" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  {conv.listing.images[0] ? (
                    <Image src={conv.listing.images[0]} alt="" width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xl">🐬</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.other?.name ?? "Пользователь"}</p>
                    {conv.unread > 0 && (
                      <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.listing.title}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage.text}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {active ? (
          <>
            <div className="p-3 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <Link href={`/listing/${active.listing.id}`} className="flex items-center gap-3 hover:opacity-80">
                <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                  {active.listing.images[0] ? (
                    <Image src={active.listing.images[0]} alt="" width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xl">🐬</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{active.listing.title}</p>
                  <p className="text-sm font-bold text-brand-600">{formatPrice(active.listing.price)}</p>
                </div>
              </Link>
            </div>
            <ChatWindow conversationId={active.id} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Выберите диалог</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
