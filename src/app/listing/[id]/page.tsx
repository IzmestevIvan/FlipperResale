import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Eye, Star, Calendar, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, conditionLabels } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";
import { ContactButton } from "./ContactButton";
import { ManageButtons } from "./ManageButtons";

interface Props {
  params: { id: string };
}

export default async function ListingPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: {
          id: true, name: true, city: true, rating: true,
          reviewCount: true, createdAt: true, avatar: true,
        },
      },
    },
  });

  if (!listing) notFound();

  await prisma.listing.update({ where: { id: params.id }, data: { views: { increment: 1 } } });

  const isSeller = session?.user.id === listing.sellerId;

  const conditionColor: Record<string, "green" | "blue" | "yellow" | "gray"> = {
    NEW: "green", LIKE_NEW: "blue", GOOD: "yellow", FAIR: "gray",
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {listing.images.length > 0 ? (
            <div className="relative aspect-video">
              <Image src={listing.images[0]} alt={listing.title} fill className="object-contain" />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center text-6xl bg-gray-50">🐬</div>
          )}
          {listing.images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {listing.images.slice(1).map((img, i) => (
                <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant={conditionColor[listing.condition]}>
                  {conditionLabels[listing.condition]}
                </Badge>
                {listing.status === "SOLD" && <Badge variant="red">Продано</Badge>}
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {listing.city}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {listing.views} просмотров
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-brand-600 shrink-0">{formatPrice(listing.price)}</p>
          </div>

          {listing.firmware && (
            <div>
              <p className="text-sm font-medium text-gray-700">Прошивка</p>
              <p className="text-sm text-gray-600">{listing.firmware}</p>
            </div>
          )}

          {listing.accessories.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">В комплекте</p>
              <div className="flex flex-wrap gap-2">
                {listing.accessories.map((a) => (
                  <Badge key={a} variant="blue">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Описание</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{listing.description}</p>
          </div>

          <p className="text-xs text-gray-400">
            Опубликовано {formatDistanceToNow(listing.createdAt, { addSuffix: true, locale: ru })}
          </p>
        </div>
      </div>

      {/* Seller sidebar */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <Link href={`/profile/${listing.seller.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg overflow-hidden">
              {listing.seller.avatar ? (
                <Image src={listing.seller.avatar} alt="" width={48} height={48} />
              ) : (
                listing.seller.name?.[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{listing.seller.name}</p>
              <p className="text-xs text-gray-500">{listing.seller.city}</p>
            </div>
          </Link>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{listing.seller.rating.toFixed(1)}</span>
              <span className="text-gray-500">({listing.seller.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>с {format(listing.seller.createdAt, "LLLL yyyy", { locale: ru })}</span>
            </div>
          </div>

          {isSeller ? (
            <ManageButtons listingId={listing.id} status={listing.status} />
          ) : (
            <ContactButton
              listingId={listing.id}
              sellerId={listing.seller.id}
              sellerName={listing.seller.name ?? "Продавец"}
              disabled={listing.status === "SOLD"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
