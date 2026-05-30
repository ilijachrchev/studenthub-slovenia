import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./css/Register.css";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (role === "organizer") {
        navigate("/setup-organization");
      } else {
        navigate("/setup-feed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
            </svg>
          </div>
          <h2>Welcome To StudentHub</h2>
        </div>

        <div className="register-tabs">
          <Link to="/login">Sign In</Link>
          <span className="active">Register</span>
        </div>

        <div className="register-form">
          <input className="input" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input className="input" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="role-selector">
            <div className={`role-card ${role === "student" ? "selected" : ""}`} onClick={() => setRole("student")}>
              <div className="role-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
                </svg>
              </div>
              <div className="role-info">
                <h3>Student</h3>
                <p>I'm a university student looking for events to attend</p>
              </div>
              <span className="role-check">
                {role === "student" ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary)" stroke="white" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </span>
            </div>

            <div className={`role-card ${role === "organizer" ? "selected" : ""}`} onClick={() => setRole("organizer")}>
              <div className="role-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-4h6v4" />
                </svg>
              </div>
              <div className="role-info">
                <h3>Organization</h3>
                <p>I represent a student club, faculty group, or other organization that hosts events</p>
              </div>
              <span className="role-check">
                {role === "organizer" ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary)" stroke="white" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          {role === "organizer" && (
            <p className="register-note">Organizations need admin approval before posting events.</p>
          )}

          {error && <p className="error-text">{error}</p>}

          <button className="btn-primary" onClick={handleRegister} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="register-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;