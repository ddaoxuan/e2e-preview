"use client";

import { useState, type FormEvent } from "react";

type Task = { id: string; title: string; done: boolean };
type Filter = "All" | "Active" | "Completed";

const initialTasks: Task[] = [
  { id: "preview", title: "Open the preview", done: true },
  { id: "mobile", title: "Check the mobile layout", done: false },
  { id: "tests", title: "Run the end-to-end tests", done: false },
];
const filters: Filter[] = ["All", "Active", "Completed"];

export default function LaunchChecklist() {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [error, setError] = useState("");
  const completed = tasks.filter((task) => task.done).length;
  const visibleTasks = tasks.filter((task) =>
    filter === "All" ? true : filter === "Completed" ? task.done : !task.done,
  );

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Enter a task before adding it.");
      return;
    }

    setTasks((current) => [
      ...current,
      { id: crypto.randomUUID(), title: trimmedTitle, done: false },
    ]);
    setTitle("");
    setError("");
    setFilter("All");
  }

  return (
    <section className="checklist" aria-label="Launch tasks">
      <div className="progress-header">
        <h2>Pre-flight checks</h2>
        <p role="status">{completed} of {tasks.length} complete</p>
      </div>
      <progress aria-label="Checklist progress" value={completed} max={tasks.length} />

      <form onSubmit={addTask} noValidate>
        <label htmlFor="task-title">New task</label>
        <div className="form-row">
          <input
            id="task-title"
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError("");
            }}
            placeholder="What needs a final check?"
            maxLength={120}
            aria-invalid={!!error}
            aria-describedby={error ? "task-error" : undefined}
          />
          <button className="add-button" type="submit">Add task</button>
        </div>
        {error ? <p id="task-error" className="error" role="alert">{error}</p> : null}
      </form>

      <div className="filters" role="group" aria-label="Filter tasks">
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {visibleTasks.length ? (
        <ul className="task-list" aria-label="Tasks">
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <label className={task.done ? "task done" : "task"}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => setTasks((current) => current.map((item) =>
                    item.id === task.id ? { ...item, done: !item.done } : item,
                  ))}
                />
                <span>{task.title}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">
          {filter === "Active"
            ? "All clear. Every task is complete."
            : "No completed tasks yet. Check off a task to get started."}
        </p>
      )}
    </section>
  );
}
