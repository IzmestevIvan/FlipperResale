import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Файл не передан" }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Недопустимый тип файла" }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Файл слишком большой (макс 4 МБ)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(join(uploadDir, safeName), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${safeName}` });
}
