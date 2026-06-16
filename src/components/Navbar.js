"use client";
import { useState } from "react";

export default function Navbar({ onSearch, searchValue }) {
  return (
    <nav style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, fontWeight: 700 }}>
        <span style={{ fontSize: 24 }}>⬡</span>
        devChart
      </div>
      <div style={{ fontSize: 14, color: "var(--muted)" }}>
        Club Kanban Board
      </div>
    </nav>
  );
}
