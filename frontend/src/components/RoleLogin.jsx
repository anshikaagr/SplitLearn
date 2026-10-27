
import { useState } from "react";

export default function RoleLogin({ onLogin }) {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const expectedUsername = role === "teacher" ? "ADMIN" : "STUDENT";
    const expectedPassword = role === "teacher" ? "ADMIN" : "STUDENT";

    if (
      username.trim().toUpperCase() === expectedUsername &&
      password === expectedPassword
    ) {
      setError("");
      onLogin(role);
    } else {
      setError("Incorrect username or password. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-mark">S</span>
          <span>SplitLearn</span>
        </div>

        <p className="login-eyebrow">COMPUTER NETWORKS PROJECT</p>
        <h1>Welcome back.</h1>
        <p className="login-description">
          Sign in to access your learning workspace.
        </p>

        <div className="role-options">
          <button
            type="button"
            className={`role-option ${role === "student" ? "selected" : ""}`}
            onClick={() => {
              setRole("student");
              setError("");
            }}
            aria-pressed={role === "student"}
          >
            <span className="role-text">
              <strong>Student</strong>
              <small>Access your lectures</small>
            </span>
          </button>

          <button
            type="button"
            className={`role-option ${role === "teacher" ? "selected" : ""}`}
            onClick={() => {
              setRole("teacher");
              setError("");
            }}
            aria-pressed={role === "teacher"}
          >
            <span className="role-text">
              <strong>Admin / Faculty</strong>
              <small>Manage lecture content</small>
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Enter username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-continue" type="submit">
            Sign in <span>→</span>
          </button>
        </form>

        <p className="login-footer">
          SMARTER STREAMING. BETTER LEARNING.
        </p>
      </section>
    </main>
  );
}
