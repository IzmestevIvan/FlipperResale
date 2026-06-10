import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(5, "Заголовок минимум 5 символов"),
  description: z.string().min(20, "Описание минимум 20 символов"),
  price: z.number().int().positive("Цена должна быть положительной"),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  firmware: z.string().optional(),
  accessories: z.array(z.string()).default([]),
  images: z.array(z.string()).min(1, "Добавьте хотя бы одно фото"),
  city: z.string().min(2, "Укажите город"),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const condition = searchParams.get("condition");
  const city = searchParams.get("city");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }
  if (condition) where.condition = condition;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseInt(minPrice) } : {}),
      ...(maxPrice ? { lte: parseInt(maxPrice) } : {}),
    };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { seller: { select: { id: true, name: true, city: true, rating: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ listings, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: { ...parsed.data, sellerId: session.user.id },
  });

  return NextResponse.json(listing, { status: 201 });
}
