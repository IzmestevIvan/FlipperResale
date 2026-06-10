import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing/ListingCard";
import { SearchFilters } from "@/components/listing/SearchFilters";
import { Suspense } from "react";

interface SearchProps {
  searchParams: {
    q?: string;
    condition?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

async function getListings(sp: SearchProps["searchParams"]) {
  const page = parseInt(sp.page ?? "1");
  const limit = 20;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.condition) where.condition = sp.condition;
  if (sp.city) where.city = { contains: sp.city, mode: "insensitive" };
  if (sp.minPrice || sp.maxPrice) {
    where.price = {
      ...(sp.minPrice ? { gte: parseInt(sp.minPrice) } : {}),
      ...(sp.maxPrice ? { lte: parseInt(sp.maxPrice) } : {}),
    };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { seller: { select: { id: true, name: true, rating: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total, pages: Math.ceil(total / limit), page };
}

export default async function SearchPage({ searchParams }: SearchProps) {
  const { listings, total, pages, page } = await getListings(searchParams);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", String(p));
    return `/search?${params.toString()}`;
  };

  return (
    <div className="flex gap-6">
      <Suspense>
        <SearchFilters />
      </Suspense>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {searchParams.q ? `Поиск: «${searchParams.q}»` : "Все объявления"}
            <span className="ml-2 text-sm font-normal text-gray-500">{total} шт.</span>
          </h1>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-600 font-medium">Ничего не найдено</p>
            <p className="text-sm text-gray-500 mt-1">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((l) => (
                <ListingCard key={l.id} {...l} createdAt={l.createdAt.toISOString()} />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={buildPageUrl(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-brand-500 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
