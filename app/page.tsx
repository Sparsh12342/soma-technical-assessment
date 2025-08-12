"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

type Todo = {
  id: number;
  title: string;
  dueDate?: string | null;
  imageUrl?: string | null;
};

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [due, setDue] = useState(""); // yyyy-MM-dd from <input type="date">
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => { fetchTodos(); }, []);

  async function fetchTodos() {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
  }

  async function handleAddTodo() {
    if (!newTodo.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTodo,
        dueDate: due ? new Date(due).toISOString() : null, // send ISO if picked
      }),
    });
    setNewTodo("");
    setDue("");
    fetchTodos();
  }

  async function handleDeleteTodo(id: number) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  }

  const isOverdue = (iso?: string | null) =>
    iso ? new Date(iso).getTime() < Date.now() : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Things To Do App</h1>

        <div className="flex mb-6 gap-2">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-full focus:outline-none text-gray-700"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <input
            type="date"
            className="p-3 rounded-md"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
          <button
            onClick={handleAddTodo}
            className="bg-white text-indigo-600 p-3 rounded-r-full hover:bg-gray-100 transition duration-300"
          >
            Add
          </button>
        </div>

        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className="bg-white bg-opacity-90 p-4 mb-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-gray-800 block font-medium">{todo.title}</span>

                  {todo.dueDate && (
                    <span
                      className={`text-sm block mt-1 ${
                        isOverdue(todo.dueDate) ? "text-red-600 font-semibold" : "text-gray-600"
                      }`}
                    >
                      Due: {new Date(todo.dueDate).toLocaleString()}
                    </span>
                  )}

                  <div className="mt-3">
                    {!todo.imageUrl ? (
                      <div className="animate-pulse h-32 w-full bg-gray-100 rounded" />
                    ) : (
                      <Image
                        src={todo.imageUrl}
                        alt={todo.title}
                        width={640}
                        height={360}
                        className="rounded"
                      />
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 transition duration-300 ml-3"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


