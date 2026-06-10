import Image from "next/image";
import Link from "next/link";
import { MapPin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, conditionLabels } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  city: string;
  views: number;
  createdAt: string | Date;
  seller?: { name: string | null; rating: number };
}

const conditionVariant: Record<string, "green" | "blue" | "yellow" | "gray"> = {
  NEW: "green",
  LIKE_NEW: "blue",
  GOOD: "yellow",
  FAIR: "gray",
};

export function ListingCard({ id, title, price, condition, images, city, views, createdAt, seller }: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-brand-300 transition-all">
      <div className="aspect-square relative bg-gray-100">
        {images[0] ? (
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">🐬</div>
        )}
        <Badge
          variant={conditionVariant[condition] ?? "gray"}
          className="absolute top-2 left-2"
        >
          {conditionLabels[condition]}
        </Badge>
      </div>
      <div className="p-3">
        <p className="font-bold text-lg text-gray-900">{formatPrice(price)}</p>
        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{title}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {city}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru })}
        </p>
      </div>
    </Link>
  );
}
