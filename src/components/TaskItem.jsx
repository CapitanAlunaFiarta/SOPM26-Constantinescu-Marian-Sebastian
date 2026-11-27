import React from "react";

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      background: "#0b0c10",
      border: "1px solid #262936",
      borderRadius: "8px",
      marginBottom: "8px"
    }}>
      <span style={{ textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "#777" : "#fff" }}>
        {task.completed ? "✅" : "⏳"} {task.title}
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" className="btn-secondary" onClick={() => onToggle(task.id)}>
          {task.completed ? "Reactivează" : "Finalizează"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          style={{ borderColor: "#e74c3c", color: "#ff6b6b" }}
          onClick={() => onDelete(task.id)}
        >
          Șterge
        </button>
      </div>
    </li>
  );
}
