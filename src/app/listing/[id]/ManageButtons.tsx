"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Pencil, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  listingId: string;
  status: string;
}

export function ManageButtons({ listingId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(newStatus: string) {
    setLoading(newStatus);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(null);
  }

  async function deleteListing() {
    if (!confirm("Удалить объявление?")) return;
    setLoading("delete");
    await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    router.push("/profile");
  }

  return (
    <div className="space-y-2">
      <Link href={`/listings/edit/${listingId}`} className="block">
        <Button variant="secondary" className="w-full">
          <Pencil className="w-4 h-4 mr-2" />
          Редактировать
        </Button>
      </Link>
      {status === "ACTIVE" && (
        <Button
          className="w-full"
          onClick={() => setStatus("SOLD")}
          loading={loading === "SOLD"}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Отметить как продано
        </Button>
      )}
      {status === "SOLD" && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setStatus("ACTIVE")}
          loading={loading === "ACTIVE"}
        >
          Вернуть в активные
        </Button>
      )}
      <Button
        variant="danger"
        className="w-full"
        onClick={deleteListing}
        loading={loading === "delete"}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Удалить
      </Button>
    </div>
  );
}
