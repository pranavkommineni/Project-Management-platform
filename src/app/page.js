"use client";
import Navbar from "../components/Navbar";
import KanbanBoard from "../components/KanbanBoard";

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <KanbanBoard />
    </main>
  );
}