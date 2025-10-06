import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Registration = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/users/", formData);
      setMessage("✅ User registered successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setMessage("❌ Registration failed. Try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
      <p style={styles.text}>
        Already have an account? <Link to="/" style={styles.link}>Login here</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "30px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    color: "#1D4ED8",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#1D4ED8",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontSize: "14px",
  },
  text: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#333",
  },
  link: {
    color: "#1D4ED8",
    textDecoration: "underline",
  },
};

export default Registration;
