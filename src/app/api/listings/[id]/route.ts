import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: {
          id: true, name: true, city: true, rating: true,
          reviewCount: true, createdAt: true, avatar: true, phone: true,
        },
      },
    },
  });

  if (!listing) return NextResponse.json({ error: "Объявление не найдено" }, { status: 404 });

  await prisma.listing.update({ where: { id: params.id }, data: { views: { increment: 1 } } });

  return NextResponse.json(listing);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.listing.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Нет прав" }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
