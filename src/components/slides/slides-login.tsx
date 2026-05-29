"use client";

import { FormEvent, useState } from "react";

export function SlidesLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/slides-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Unable to verify password.");
        return;
      }

      window.location.reload();
    } catch {
      setError("Unable to verify password right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="slides-login-shell">
      <div className="slides-login-card">
        <h1 className="slides-login-title">Presentation Slides</h1>
        <p className="slides-login-subtitle">Enter the password to open the slide deck.</p>
        <form className="slides-login-form" onSubmit={onSubmit}>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="slides-login-input"
            required
          />
          <button type="submit" className="slides-login-button" disabled={isSubmitting}>
            {isSubmitting ? "Checking..." : "Open Slides"}
          </button>
        </form>
        {error ? <p className="slides-login-error">{error}</p> : null}
      </div>
    </section>
  );
}
