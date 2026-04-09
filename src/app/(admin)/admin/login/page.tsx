"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState("/admin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") ?? "/admin");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Login failed.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Unable to login right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-panel admin-login-panel">
      <div className="admin-login-brand">
        <img src="/images/logo.png" alt="Prabhawati Vidyapeeth" />
        <div>
          <span className="admin-login-school-label">Prabhawati Vidyapeeth</span>
          <h1>Admin CMS</h1>
          <p>Sign in to manage frontend content, media, and contact submissions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-login-form">
        <div className="admin-field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@pvp.in"
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor="admin-password">Password</label>
          <div className="admin-login-password-wrap">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="admin-login-eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        {error ? <div className="admin-status error">{error}</div> : null}

        <div className="admin-button-row">
          <button className="admin-button" type="submit" disabled={loading}>
            <i className="fa-solid fa-right-to-bracket" /> {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>

      <p className="admin-login-note">
        Use the admin credentials configured in <code>.env.local</code> and created by the seed script.
      </p>
    </section>
  );
}
