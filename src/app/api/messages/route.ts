import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages?conversationId=...  — получить сообщения
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const conversationId = new URL(req.url).searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "conversationId обязателен" }, { status: 400 });

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  });
  if (!participant) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: session.user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json(messages);
}

// POST /api/messages — отправить сообщение или начать чат
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { listingId, text, conversationId: existingConvId } = await req.json();

  if (!text?.trim()) return NextResponse.json({ error: "Сообщение пустое" }, { status: 400 });

  let conversationId = existingConvId;

  if (!conversationId) {
    if (!listingId) return NextResponse.json({ error: "listingId обязателен" }, { status: 400 });

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return NextResponse.json({ error: "Объявление не найдено" }, { status: 404 });
    if (listing.sellerId === session.user.id) {
      return NextResponse.json({ error: "Нельзя написать себе" }, { status: 400 });
    }

    // Проверяем, нет ли уже диалога по этому объявлению
    const existing = await prisma.conversation.findFirst({
      where: {
        listingId,
        participants: { some: { userId: session.user.id } },
      },
    });

    if (existing) {
      conversationId = existing.id;
    } else {
      const conv = await prisma.conversation.create({
        data: {
          listingId,
          participants: {
            create: [{ userId: session.user.id }, { userId: listing.sellerId }],
          },
        },
      });
      conversationId = conv.id;
    }
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: session.user.id, text },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message, conversationId }, { status: 201 });
}
