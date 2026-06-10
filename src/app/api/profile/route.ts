import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, city: true, avatar: true, rating: true, reviewCount: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { name, phone, city, avatar } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone, city, avatar },
    select: { id: true, name: true, email: true, phone: true, city: true, avatar: true },
  });

  return NextResponse.json(user);
}
