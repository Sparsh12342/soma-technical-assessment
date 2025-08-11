import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchPexelsImage } from "@/lib/pexels";

export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title: string = body?.title;
    const description: string | null = body?.description ?? null;
    const dueDateISO: string | null = body?.dueDate ?? null;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const imageUrl = await fetchPexelsImage(title);
    const dueDate = dueDateISO ? new Date(dueDateISO) : null;

    const task = await prisma.task.create({
      data: { title, description, imageUrl, dueDate },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
