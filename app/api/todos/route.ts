import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchPexelsImage } from "@/lib/pexels";

export async function GET() {
  const todos = await prisma.todo.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const { title, dueDate } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const imageUrl = await fetchPexelsImage(title);
  const todo = await prisma.todo.create({
    data: {
      title,
      imageUrl,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  return NextResponse.json(todo, { status: 201 });
}
