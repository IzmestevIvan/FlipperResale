"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Message {
  id: string;
  text: string;
  createdAt: string;
  sender: { id: string; name: string | null; avatar: string | null };
}

interface Props {
  conversationId: string;
}

export function ChatWindow({ conversationId }: Props) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/messages?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then(setMessages);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text }),
    });
    const { message } = await res.json();
    setMessages((prev) => [...prev, message]);
    setText("");
    setSending(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender.id === session?.user.id;
          return (
            <div key={msg.id} className={cn("flex gap-2", isMe && "flex-row-reverse")}>
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                {msg.sender.avatar ? (
                  <Image src={msg.sender.avatar} alt="" width={32} height={32} />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-medium text-gray-500">
                    {msg.sender.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <div className={cn("max-w-xs lg:max-w-md", isMe && "items-end flex flex-col")}>
                <div
                  className={cn(
                    "px-3 py-2 rounded-2xl text-sm",
                    isMe
                      ? "bg-brand-500 text-white rounded-tr-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                  )}
                >
                  {msg.text}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ru })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="p-4 border-t border-gray-200 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-brand-500 text-white p-2 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
