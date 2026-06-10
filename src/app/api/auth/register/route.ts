import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "Имя слишком короткое"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль минимум 6 символов"),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, email, password, phone, city } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email уже зарегистрирован" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, city },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json(user, { status: 201 });
}
