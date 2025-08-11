import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { done } = await req.json();
  const id = Number(params.id);
  await prisma.task.update({ where: { id }, data: { done: !!done } });
  return NextResponse.json({ ok: true });
}
