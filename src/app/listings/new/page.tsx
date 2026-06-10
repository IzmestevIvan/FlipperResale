"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/listing/ImageUploader";
import { conditionLabels } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(5, "Минимум 5 символов"),
  description: z.string().min(20, "Минимум 20 символов"),
  price: z.coerce.number().int().positive("Укажите цену"),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  firmware: z.string().optional(),
  city: z.string().min(2, "Укажите город"),
});

type FormData = z.infer<typeof schema>;

const ACCESSORIES = ["Оригинальный кабель", "Чехол", "SD-карта", "Коробка", "NFC-карты", "iButton"];

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [accessories, setAccessories] = useState<string[]>([]);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { condition: "GOOD" },
  });

  if (status === "unauthenticated") { router.push("/login"); return null; }

  async function onSubmit(data: FormData) {
    if (images.length === 0) { setServerError("Добавьте хотя бы одно фото"); return; }
    setServerError("");

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, images, accessories }),
    });

    if (!res.ok) {
      const e = await res.json();
      setServerError(e.error ?? "Ошибка сервера");
      return;
    }

    const listing = await res.json();
    router.push(`/listing/${listing.id}`);
  }

  function toggleAccessory(a: string) {
    setAccessories((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Новое объявление</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Фотографии</h2>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Основная информация</h2>

          <Input
            label="Заголовок"
            placeholder="Flipper Zero в комплекте с чехлом"
            error={errors.title?.message}
            {...register("title")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              rows={4}
              placeholder="Расскажите о состоянии, что было сделано, причина продажи..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Цена, ₽"
              type="number"
              placeholder="15000"
              error={errors.price?.message}
              {...register("price")}
            />
            <Input
              label="Город"
              placeholder="Москва"
              error={errors.city?.message}
              {...register("city")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Состояние</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register("condition")}
            >
              {Object.entries(conditionLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <Input
            label="Прошивка (необязательно)"
            placeholder="Unleashed 0.76.1"
            {...register("firmware")}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">В комплекте</h2>
          <div className="flex flex-wrap gap-2">
            {ACCESSORIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAccessory(a)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  accessories.includes(a)
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "border-gray-300 text-gray-600 hover:border-brand-300"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Опубликовать объявление
        </Button>
      </form>
    </div>
  );
}
