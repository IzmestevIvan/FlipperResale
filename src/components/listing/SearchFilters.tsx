"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { conditionLabels } from "@/lib/utils";

export function SearchFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [city, setCity] = useState(sp.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(sp.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");
  const [condition, setCondition] = useState(sp.get("condition") ?? "");

  function apply() {
    const params = new URLSearchParams(sp.toString());
    if (city) params.set("city", city); else params.delete("city");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (condition) params.set("condition", condition); else params.delete("condition");
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  }

  function reset() {
    setCity(""); setMinPrice(""); setMaxPrice(""); setCondition("");
    const q = sp.get("q");
    router.push(q ? `/search?q=${q}` : "/search");
  }

  return (
    <aside className="w-64 shrink-0 space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Фильтры</h3>

        <Input label="Город" placeholder="Москва" value={city} onChange={(e) => setCity(e.target.value)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Цена, ₽</label>
          <div className="flex gap-2">
            <input
              type="number" placeholder="от" value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="number" placeholder="до" value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Состояние</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Любое</option>
            {Object.entries(conditionLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={apply}>Применить</Button>
          <Button variant="secondary" onClick={reset}>Сброс</Button>
        </div>
      </div>
    </aside>
  );
}
