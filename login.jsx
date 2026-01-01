import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://election-2nlh.onrender.com";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // ✅ FIXED: Backend expects FormData for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 403) {
          throw new Error("❌ This account is already logged in from another device!");
        } else if (response.status === 401) {
          throw new Error("❌ Invalid Username or Password");
        } else {
          throw new Error(data.detail || "Login failed");
        }
      }

      // ✅ Save all session data
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("main_admin_id", data.main_admin_id);
        localStorage.setItem("section_no", data.section_no);
      }

      setSuccess("✅ Successfully logged in");
      
      // Redirect after short delay
      navigate("/dashboard", { replace: true });
      // window.location.replace("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>🔐 Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  card: {
    width: "100%",
    maxWidth: "360px",
    padding: "30px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginBottom: "8px",
    padding: "8px",
    background: "#fee",
    borderRadius: "4px"
  },
  success: {
    color: "green",
    fontSize: "13px",
    marginBottom: "8px",
    padding: "8px",
    background: "#efe",
    borderRadius: "4px"
  }
};