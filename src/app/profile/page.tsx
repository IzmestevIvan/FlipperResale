"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/listing/ListingCard";
import { Star, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  createdAt: string;
  listings: Array<{ id: string; title: string; price: number; condition: string; images: string[]; city: string; views: number; createdAt: string }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ name: string; phone: string; city: string }>();

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      reset({ name: data.name ?? "", phone: data.phone ?? "", city: data.city ?? "" });
    });
  }, [status, router, reset]);

  async function onSave(data: { name: string; phone: string; city: string }) {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setProfile((prev) => prev ? { ...prev, ...updated } : prev);
    setEditing(false);
    setSaving(false);
  }

  if (!profile) return <div className="text-center py-12 text-gray-500">Загрузка...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl overflow-hidden shrink-0">
            {profile.avatar ? (
              <Image src={profile.avatar} alt="" width={80} height={80} />
            ) : (
              profile.name?.[0]?.toUpperCase() ?? "?"
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleSubmit(onSave)} className="space-y-3">
                <Input label="Имя" {...register("name")} />
                <Input label="Телефон" {...register("phone")} />
                <Input label="Город" {...register("city")} />
                <div className="flex gap-2">
                  <Button type="submit" loading={saving}>Сохранить</Button>
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Отмена</Button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900">{profile.name ?? "Без имени"}</h1>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                  {profile.city && (
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.city}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {profile.rating.toFixed(1)} ({profile.reviewCount} отзывов)
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    с {format(new Date(profile.createdAt), "LLLL yyyy", { locale: ru })}
                  </span>
                </div>
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => setEditing(true)}>
                  Редактировать
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Мои объявления
            <span className="ml-2 text-sm font-normal text-gray-500">{profile.listings.length}</span>
          </h2>
          <Link href="/listings/new">
            <Button size="sm">+ Новое</Button>
          </Link>
        </div>

        {profile.listings.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">У вас нет активных объявлений</p>
            <Link href="/listings/new" className="mt-3 inline-block">
              <Button>Разместить</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profile.listings.map((l) => (
              <ListingCard key={l.id} {...l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
