import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Shield, Star, Zap } from "lucide-react";

async function getRecentListings() {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: { seller: { select: { id: true, name: true, rating: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export default async function HomePage() {
  const listings = await getRecentListings();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-12 bg-white rounded-2xl border border-gray-200 px-8">
        <div className="text-6xl mb-4">🐬</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          FlipperMarket
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
          Покупайте и продавайте Flipper Zero с проверенными продавцами в России
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/search">
            <Button size="lg">
              Смотреть объявления
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/listings/new">
            <Button size="lg" variant="secondary">Продать устройство</Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Безопасно", text: "Рейтинги и отзывы о каждом продавце" },
          { icon: Star, title: "Проверено", text: "Только реальные Flipper Zero и аксессуары" },
          { icon: Zap, title: "Быстро", text: "Встроенный чат для быстрой договорённости" },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="bg-brand-100 rounded-lg p-2.5">
              <Icon className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent listings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Свежие объявления</h2>
          <Link href="/search" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            Все объявления <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Пока нет объявлений. Станьте первым!</p>
            <Link href="/listings/new" className="mt-4 inline-block">
              <Button>Разместить объявление</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} {...l} createdAt={l.createdAt.toISOString()} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
