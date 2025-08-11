"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";

type Task = {
  id: number;
  title: string;
  description: string | null;
  done: boolean;
  dueDate: string | null;   // ISO from API
  imageUrl: string | null;
};

const fetcher = (u: string) => fetch(u).then(r => r.json());

function isOverdue(iso?: string | null) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export default function Page() {
  const { data, mutate, isLoading } = useSWR<{ tasks: Task[] }>("/api/tasks", fetcher);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState(""); // yyyy-MM-ddTHH:mm

  async function createTask() {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, dueDate: due || null }),
    });
    if (res.ok) {
      setTitle(""); setDesc(""); setDue("");
      mutate();
    } else {
      const j = await res.json().catch(()=>({error:""}));
      alert(j.error || "Failed to create task");
    }
  }

  async function toggleDone(id: number, done: boolean) {
    const res = await fetch(`/api/tasks/${id}/done`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (res.ok) mutate();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Create form */}
      <form
        onSubmit={e => { e.preventDefault(); createTask(); }}
        className="flex flex-col gap-2 border rounded p-3"
      >
        <input
          className="border rounded p-2"
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border rounded p-2"
          placeholder="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <label className="text-sm">Due date</label>
        <input
          type="datetime-local"
          className="border rounded p-2"
          value={due}
          onChange={e => setDue(e.target.value)}
        />
        <button className="bg-black text-white rounded p-2">Add task</button>
      </form>

      {/* Task list */}
      {isLoading ? (
        <div>Loading tasks…</div>
      ) : (
        <ul className="space-y-3">
          {data?.tasks?.map(t => (
            <li key={t.id} className="border rounded p-3 flex gap-3">
              <input
                type="checkbox"
                checked={t.done}
                onChange={e => toggleDone(t.id, e.target.checked)}
              />
              <div className="flex-1">
                <div className="font-medium">{t.title}</div>
                {t.description && (
                  <div className="text-sm text-gray-600">{t.description}</div>
                )}

                {t.dueDate && (
                  <div className={`text-sm ${isOverdue(t.dueDate) ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                    Due: {new Date(t.dueDate).toLocaleString()}
                  </div>
                )}

                <div className="mt-2">
                  {!t.imageUrl ? (
                    <div className="animate-pulse h-32 w-full bg-gray-100 rounded" />
                  ) : (
                    <Image
                      src={t.imageUrl}
                      alt={t.title}
                      width={640}
                      height={360}
                      className="rounded"
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

