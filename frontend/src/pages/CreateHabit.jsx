import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateHabit = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [intervalHours, setIntervalHours] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      alert("Please log in first");
      navigate("/login");
    } else {
      setUserId(storedUserId);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    const habitData = {
      name,
      category,
      frequency,
      owner_id: parseInt(userId),
      interval_hours: intervalHours ? parseInt(intervalHours) : null,
      start_date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/habits/", habitData);
      alert("Habit created successfully!");
      setName("");
      setCategory("");
      setFrequency("daily");
      setIntervalHours("");
    } catch (error) {
      alert("Failed to create habit: " + (error.response?.data?.detail || error.message));
    }
  };

  if (userId === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6", fontSize: "18px", color: "#1d4ed8", fontWeight: 500 }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6", padding: "20px" }}>
      <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px" }}>
        <h2 style={{ textAlign: "center", fontSize: "24px", color: "#0d0d0eff", marginBottom: "25px", fontWeight: 600 }}>Create a New Habit</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "6px", fontWeight: 500, color: "#1e3a8a" }}>Habit Name</label>
            <input
              type="text"
              placeholder="Enter habit name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "6px", fontWeight: 500, color: "#1e3a8a" }}>Category</label>
            <input
              type="text"
              placeholder="Fitness, Work, etc."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "6px", fontWeight: 500, color: "#1e3a8a" }}>Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ marginBottom: "6px", fontWeight: 500, color: "#1e3a8a" }}>Interval (hours, optional)</label>
            <input
              type="number"
              placeholder="Enter interval hours"
              value={intervalHours}
              onChange={(e) => setIntervalHours(e.target.value)}
              style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "16px", outline: "none" }}
            />
          </div>

          <button
            type="submit"
            style={{ backgroundColor: "#1d4ed8", color: "#ffffff", padding: "12px", fontSize: "16px", fontWeight: 500, border: "none", borderRadius: "8px", cursor: "pointer", transition: "background-color 0.3s" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
          >
            Create Habit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateHabit;
