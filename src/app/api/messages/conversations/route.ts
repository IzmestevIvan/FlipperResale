import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      listing: { select: { id: true, title: true, images: true, price: true, status: true } },
      participants: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const result = conversations.map((conv) => {
    const unread = conv.messages.filter(
      (m) => m.senderId !== session.user.id && !m.readAt
    ).length;
    const other = conv.participants.find((p) => p.userId !== session.user.id)?.user;
    return {
      id: conv.id,
      listing: conv.listing,
      other,
      lastMessage: conv.messages[0] ?? null,
      unread,
      updatedAt: conv.updatedAt,
    };
  });

  return NextResponse.json(result);
}
