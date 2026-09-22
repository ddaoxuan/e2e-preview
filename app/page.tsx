import LaunchChecklist from "./launch-checklist";

export default function Home() {
  return (
    <main className="launch-page">
      <header className="page-header">
        <p className="eyebrow">Preview lab / E2E playground</p>
        <h1>Launch checklist</h1>
        <p className="intro">
          Small checks. Confident launches. Add a task, mark it done, and see
          what’s left before you ship.
        </p>
      </header>
      <LaunchChecklist />
      <footer>
        A fresh checklist on every reload. Nothing is saved or sent to a server.
      </footer>
    </main>
  );
}
