import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, city: true, avatar: true,
      rating: true, reviewCount: true, createdAt: true,
      listings: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, price: true, condition: true, images: true, city: true, createdAt: true },
      },
      reviewsReceived: {
        include: { author: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  return NextResponse.json(user);
}
