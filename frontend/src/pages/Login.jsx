import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("userId", data.user_id.toString());
      localStorage.setItem("userEmail", data.email);
      navigate("/home");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        <p style={styles.text}>
          New user? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: "20px",
  },
  container: {
    maxWidth: "400px",
    width: "100%",
    padding: "40px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    color: "#1D4ED8",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.3s",
  },
  button: {
    padding: "12px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#1D4ED8",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  text: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#333",
  },
  link: {
    color: "#1D4ED8",
    textDecoration: "underline",
    fontWeight: "500",
  },
};

export default Login;