import React, { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Te rugăm să introduci numele activității.");
      return;
    }
    setError("");
    onAdd(cleanTitle);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="card-panel">
      <h3 style={{ marginBottom: "12px", color: "#ff6600" }}>Adaugă Activitate (Lab 5)</h3>
      {error && <p role="alert" className="alert-error">{error}</p>}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <label htmlFor="task-title" style={{ fontWeight: 600 }}>Activitate nouă:</label>
        <input
          id="task-title"
          className="text-input"
          style={{ flex: 1, minWidth: "220px" }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Verifică build-ul aplicației cu Vite..."
        />
        <button type="submit" className="btn-primary">Adaugă</button>
      </div>
    </form>
  );
}
