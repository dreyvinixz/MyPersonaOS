"use client";

import { useState, useEffect } from "react";

export function DateClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-baseline justify-between select-none">
      <div>
        <h1
          className="text-3xl font-bold tracking-tight capitalize"
          style={{ color: "var(--text)" }}
        >
          {date || "Hoje"}
        </h1>
      </div>
      <div
        className="font-mono text-lg font-medium tracking-wider px-3 py-1 rounded-md border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--accent-hover)",
        }}
      >
        {time || "--:--:--"}
      </div>
    </div>
  );
}
