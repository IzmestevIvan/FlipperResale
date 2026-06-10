"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  listingId: string;
  sellerId: string;
  sellerName: string;
  disabled?: boolean;
}

export function ContactButton({ listingId, sellerName, disabled }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, text: "Здравствуйте! Ещё продаётся?" }),
    });
    const { conversationId } = await res.json();
    router.push(`/chat?id=${conversationId}`);
  }

  return (
    <Button
      className="w-full"
      onClick={startChat}
      loading={loading}
      disabled={disabled}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      {disabled ? "Продано" : `Написать ${sellerName}`}
    </Button>
  );
}
